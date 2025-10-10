package authorization

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

// EchoAuthorizationMiddleware creates an Echo middleware for authorization
func (as *AuthorizationService) EchoAuthorizationMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Extract JWT token from Authorization header
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Authorization header required"})
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString == authHeader {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Bearer token required"})
			}

			// Parse and validate JWT token
			token, err := jwt.ParseWithClaims(tokenString, &TemporalClaims{}, func(token *jwt.Token) (interface{}, error) {
				return []byte(as.jwtSecret), nil
			})

			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
			}

			if !token.Valid {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
			}

			// Extract namespace from request
			namespace := c.Request().Header.Get("X-Temporal-Namespace")
			if namespace == "" {
				namespace = "default"
			}

			// Check namespace access
			if !as.CheckNamespaceAccess(token, namespace) {
				return c.JSON(http.StatusForbidden, map[string]string{"error": "Access denied to namespace: " + namespace})
			}

			// Check permission based on HTTP method and path
			permission := as.getRequiredPermission(c.Request().Method, c.Request().URL.Path)
			if permission != "" && !as.CheckPermission(token, permission) {
				return c.JSON(http.StatusForbidden, map[string]string{"error": "Permission denied: " + permission})
			}

			// Add user context to request
			ctx := context.WithValue(c.Request().Context(), "user_token", token)
			ctx = context.WithValue(ctx, "user_namespaces", as.GetUserNamespaces(token))
			ctx = context.WithValue(ctx, "user_permissions", as.GetUserPermissions(token))
			ctx = context.WithValue(ctx, "workflow_controls", as.GetWorkflowControls(token))

			// Update request context
			c.SetRequest(c.Request().WithContext(ctx))

			return next(c)
		}
	}
}
