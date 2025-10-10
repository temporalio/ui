package temporal_auth

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

// EchoAuthorizationMiddleware middleware for checking permissions in Echo framework
func (as *AuthorizationService) EchoAuthorizationMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Extract JWT token from Authorization header
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "Authorization header required")
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString == authHeader {
				return echo.NewHTTPError(http.StatusUnauthorized, "Bearer token required")
			}

			// Parse and validate JWT token
			token, err := jwt.ParseWithClaims(tokenString, &TemporalClaims{}, func(token *jwt.Token) (interface{}, error) {
				return []byte(as.jwtSecret), nil
			})

			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, fmt.Sprintf("Invalid token: %v", err))
			}

			if !token.Valid {
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token")
			}

			// Extract namespace from request
			namespace := c.Request().Header.Get("X-Temporal-Namespace")
			if namespace == "" {
				// Try to extract from URL path
				path := c.Request().URL.Path
				if strings.Contains(path, "/namespaces/") {
					parts := strings.Split(path, "/namespaces/")
					if len(parts) > 1 {
						namespace = strings.Split(parts[1], "/")[0]
					}
				}
			}
			
			// If still no namespace, use default
			if namespace == "" {
				namespace = "default"
			}

			// Check namespace access
			if !as.CheckNamespaceAccess(token, namespace) {
				return echo.NewHTTPError(http.StatusForbidden, fmt.Sprintf("Access denied to namespace: %s", namespace))
			}

			// Check permission based on HTTP method and path
			permission := as.getRequiredPermission(c.Request().Method, c.Request().URL.Path)
			if permission != "" && !as.CheckPermission(token, permission) {
				return echo.NewHTTPError(http.StatusForbidden, fmt.Sprintf("Permission denied: %s", permission))
			}

			// Add user context to request
			ctx := context.WithValue(c.Request().Context(), "user_token", token)
			ctx = context.WithValue(ctx, "user_namespaces", as.GetUserNamespaces(token))
			ctx = context.WithValue(ctx, "user_permissions", as.GetUserPermissions(token))
			ctx = context.WithValue(ctx, "workflow_controls", as.GetWorkflowControls(token))

			c.SetRequest(c.Request().WithContext(ctx))
			return next(c)
		}
	}
}

// getRequiredPermission determines the required permission based on HTTP method and path
func (as *AuthorizationService) getRequiredPermission(method, path string) string {
	// Map HTTP methods and paths to temporal permissions
	switch {
	case strings.Contains(path, "/workflows") && method == "GET":
		return "workflow.read"
	case strings.Contains(path, "/workflows") && method == "POST":
		return "workflow.write"
	case strings.Contains(path, "/workflows") && method == "PUT":
		return "workflow.write"
	case strings.Contains(path, "/workflows") && method == "DELETE":
		return "workflow.write"
	case strings.Contains(path, "/schedules") && method == "GET":
		return "schedule.read"
	case strings.Contains(path, "/schedules") && method == "POST":
		return "schedule.write"
	case strings.Contains(path, "/schedules") && method == "PUT":
		return "schedule.write"
	case strings.Contains(path, "/schedules") && method == "DELETE":
		return "schedule.write"
	case strings.Contains(path, "/namespaces") && method == "GET":
		return "namespace.read"
	case strings.Contains(path, "/namespaces") && method == "POST":
		return "namespace.write"
	default:
		return "workflow.read" // Default permission
	}
}
