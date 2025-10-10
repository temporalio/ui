package authorization

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// TemporalClaims represents the custom claims in the JWT token
type TemporalClaims struct {
	jwt.RegisteredClaims
	TemporalNamespaces    []string          `json:"temporal_namespaces"`
	TemporalPermissions   []string          `json:"temporal_permissions"`
	TemporalWorkflowActions []string        `json:"temporal_workflow_actions"`
	TemporalWorkflowControls map[string]bool `json:"temporal_workflow_controls"`
}

// AuthorizationService handles namespace and permission-based access control
type AuthorizationService struct {
	jwtSecret string
}

// NewAuthorizationService creates a new authorization service
func NewAuthorizationService(jwtSecret string) *AuthorizationService {
	return &AuthorizationService{
		jwtSecret: jwtSecret,
	}
}

// CheckNamespaceAccess verifies if user has access to the requested namespace
func (as *AuthorizationService) CheckNamespaceAccess(token *jwt.Token, requestedNamespace string) bool {
	claims, ok := token.Claims.(*TemporalClaims)
	if !ok {
		return false
	}

	// Check if user has access to all namespaces
	for _, namespace := range claims.TemporalNamespaces {
		if namespace == "*" {
			return true
		}
		if namespace == requestedNamespace {
			return true
		}
	}

	return false
}

// CheckPermission verifies if user has the requested permission
func (as *AuthorizationService) CheckPermission(token *jwt.Token, requestedPermission string) bool {
	claims, ok := token.Claims.(*TemporalClaims)
	if !ok {
		return false
	}

	// Check if user has all permissions
	for _, permission := range claims.TemporalPermissions {
		if permission == "*" {
			return true
		}
		if permission == requestedPermission {
			return true
		}
	}

	return false
}

// CheckWorkflowAction verifies if user can perform the requested workflow action
func (as *AuthorizationService) CheckWorkflowAction(token *jwt.Token, action string) bool {
	claims, ok := token.Claims.(*TemporalClaims)
	if !ok {
		return false
	}

	// Check workflow controls first
	if controls, exists := claims.TemporalWorkflowControls[action+"Disabled"]; exists {
		return !controls
	}

	// Check workflow actions
	for _, workflowAction := range claims.TemporalWorkflowActions {
		if workflowAction == "*" {
			return true
		}
		if workflowAction == action {
			return true
		}
	}

	return false
}

// GetUserNamespaces returns the list of namespaces the user can access
func (as *AuthorizationService) GetUserNamespaces(token *jwt.Token) []string {
	claims, ok := token.Claims.(*TemporalClaims)
	if !ok {
		return []string{"default"}
	}

	return claims.TemporalNamespaces
}

// GetUserPermissions returns the list of permissions the user has
func (as *AuthorizationService) GetUserPermissions(token *jwt.Token) []string {
	claims, ok := token.Claims.(*TemporalClaims)
	if !ok {
		return []string{"workflow.read"}
	}

	return claims.TemporalPermissions
}

// GetWorkflowControls returns the workflow action controls for the user
func (as *AuthorizationService) GetWorkflowControls(token *jwt.Token) map[string]bool {
	claims, ok := token.Claims.(*TemporalClaims)
	if !ok {
		return map[string]bool{
			"workflowTerminateDisabled": true,
			"workflowCancelDisabled":    true,
			"workflowSignalDisabled":    true,
			"workflowResetDisabled":     true,
			"workflowUpdateDisabled":    true,
			"startWorkflowDisabled":     true,
			"batchActionsDisabled":      true,
		}
	}

	return claims.TemporalWorkflowControls
}

// AuthorizationMiddleware middleware for checking permissions
func (as *AuthorizationService) AuthorizationMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extract JWT token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			http.Error(w, "Bearer token required", http.StatusUnauthorized)
			return
		}

		// Parse and validate JWT token
		token, err := jwt.ParseWithClaims(tokenString, &TemporalClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(as.jwtSecret), nil
		})

		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		if !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Extract namespace from request
		namespace := r.Header.Get("X-Temporal-Namespace")
		if namespace == "" {
			namespace = "default"
		}

		// Check namespace access
		if !as.CheckNamespaceAccess(token, namespace) {
			http.Error(w, fmt.Sprintf("Access denied to namespace: %s", namespace), http.StatusForbidden)
			return
		}

		// Check permission based on HTTP method and path
		permission := as.getRequiredPermission(r.Method, r.URL.Path)
		if permission != "" && !as.CheckPermission(token, permission) {
			http.Error(w, fmt.Sprintf("Permission denied: %s", permission), http.StatusForbidden)
			return
		}

		// Add user context to request
		ctx := context.WithValue(r.Context(), "user_token", token)
		ctx = context.WithValue(ctx, "user_namespaces", as.GetUserNamespaces(token))
		ctx = context.WithValue(ctx, "user_permissions", as.GetUserPermissions(token))
		ctx = context.WithValue(ctx, "workflow_controls", as.GetWorkflowControls(token))

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// getRequiredPermission maps HTTP methods and paths to required permissions
func (as *AuthorizationService) getRequiredPermission(method, path string) string {
	switch method {
	case "GET":
		return "workflow.read"
	case "POST":
		if strings.Contains(path, "/workflows/") && strings.Contains(path, "/terminate") {
			return "workflow.terminate"
		} else if strings.Contains(path, "/workflows/") && strings.Contains(path, "/cancel") {
			return "workflow.cancel"
		} else if strings.Contains(path, "/workflows/") && strings.Contains(path, "/signal") {
			return "workflow.signal"
		} else if strings.Contains(path, "/workflows/") && strings.Contains(path, "/reset") {
			return "workflow.reset"
		} else if strings.Contains(path, "/workflows/") && strings.Contains(path, "/update") {
			return "workflow.update"
		} else if strings.Contains(path, "/workflows") {
			return "workflow.start"
		}
		return "workflow.read"
	case "PUT", "PATCH":
		return "workflow.update"
	case "DELETE":
		return "workflow.terminate"
	default:
		return "workflow.read"
	}
}

// GetUserContext extracts user context from request
func GetUserContext(r *http.Request) (token *jwt.Token, namespaces []string, permissions []string, workflowControls map[string]bool) {
	token, _ = r.Context().Value("user_token").(*jwt.Token)
	namespaces, _ = r.Context().Value("user_namespaces").([]string)
	permissions, _ = r.Context().Value("user_permissions").([]string)
	workflowControls, _ = r.Context().Value("workflow_controls").(map[string]bool)
	return
}
