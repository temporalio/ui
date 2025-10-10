package authorization

import (
	"context"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// TemporalClaims represents the JWT claims for Temporal authorization
type TemporalClaims struct {
	jwt.RegisteredClaims
	
	// Temporal-specific claims
	TemporalNamespaces     string `json:"temporal_namespaces"`
	TemporalPermissions    string `json:"temporal_permissions"`
	TemporalWorkflowActions string `json:"temporal_workflow_actions"`
	
	// Standard claims
	Email    string `json:"email"`
	Name     string `json:"name"`
	Username string `json:"preferred_username"`
}

// AuthorizationService handles temporal authorization logic
type AuthorizationService struct {
	jwtSecret string
}

// NewAuthorizationService creates a new authorization service
func NewAuthorizationService(jwtSecret string) *AuthorizationService {
	return &AuthorizationService{
		jwtSecret: jwtSecret,
	}
}

// CheckNamespaceAccess checks if user has access to a specific namespace
func (as *AuthorizationService) CheckNamespaceAccess(token *jwt.Token, namespace string) bool {
	claims, ok := token.Claims.(*TemporalClaims)
	if !ok {
		return false
	}
	
	// If no namespaces specified, deny access
	if claims.TemporalNamespaces == "" {
		return false
	}
	
	// Check if namespace is in the allowed list
	allowedNamespaces := strings.Split(claims.TemporalNamespaces, ",")
	for _, allowedNS := range allowedNamespaces {
		if strings.TrimSpace(allowedNS) == namespace {
			return true
		}
	}
	
	return false
}

// CheckPermission checks if user has a specific permission
func (as *AuthorizationService) CheckPermission(token *jwt.Token, permission string) bool {
	claims, ok := token.Claims.(*TemporalClaims)
	if !ok {
		return false
	}
	
	// If no permissions specified, deny access
	if claims.TemporalPermissions == "" {
		return false
	}
	
	// Check if permission is in the allowed list
	allowedPermissions := strings.Split(claims.TemporalPermissions, ",")
	for _, allowedPerm := range allowedPermissions {
		if strings.TrimSpace(allowedPerm) == permission {
			return true
		}
	}
	
	return false
}

// CheckWorkflowAction checks if user can perform a specific workflow action
func (as *AuthorizationService) CheckWorkflowAction(token *jwt.Token, action string) bool {
	claims, ok := token.Claims.(*TemporalClaims)
	if !ok {
		return false
	}
	
	// If no workflow actions specified, deny access
	if claims.TemporalWorkflowActions == "" {
		return false
	}
	
	// Check if action is in the allowed list
	allowedActions := strings.Split(claims.TemporalWorkflowActions, ",")
	for _, allowedAction := range allowedActions {
		if strings.TrimSpace(allowedAction) == action {
			return true
		}
	}
	
	return false
}

// GetUserNamespaces returns the list of namespaces the user can access
func (as *AuthorizationService) GetUserNamespaces(token *jwt.Token) []string {
	claims, ok := token.Claims.(*TemporalClaims)
	if !ok {
		return []string{}
	}
	
	if claims.TemporalNamespaces == "" {
		return []string{}
	}
	
	namespaces := strings.Split(claims.TemporalNamespaces, ",")
	for i, ns := range namespaces {
		namespaces[i] = strings.TrimSpace(ns)
	}
	
	return namespaces
}

// GetUserPermissions returns the list of permissions the user has
func (as *AuthorizationService) GetUserPermissions(token *jwt.Token) []string {
	claims, ok := token.Claims.(*TemporalClaims)
	if !ok {
		return []string{}
	}
	
	if claims.TemporalPermissions == "" {
		return []string{}
	}
	
	permissions := strings.Split(claims.TemporalPermissions, ",")
	for i, perm := range permissions {
		permissions[i] = strings.TrimSpace(perm)
	}
	
	return permissions
}

// GetWorkflowControls returns the workflow action controls for the user
func (as *AuthorizationService) GetWorkflowControls(token *jwt.Token) map[string]bool {
	claims, ok := token.Claims.(*TemporalClaims)
	if !ok {
		return map[string]bool{
			"workflowResetDisabled":    true,
			"workflowTerminateDisabled": true,
			"workflowCancelDisabled":   true,
			"workflowSignalDisabled":   true,
		}
	}
	
	controls := map[string]bool{
		"workflowResetDisabled":    true,
		"workflowTerminateDisabled": true,
		"workflowCancelDisabled":   true,
		"workflowSignalDisabled":   true,
	}
	
	// Enable actions based on user permissions
	if claims.TemporalWorkflowActions != "" {
		allowedActions := strings.Split(claims.TemporalWorkflowActions, ",")
		for _, action := range allowedActions {
			action = strings.TrimSpace(action)
			switch action {
			case "reset":
				controls["workflowResetDisabled"] = false
			case "terminate":
				controls["workflowTerminateDisabled"] = false
			case "cancel":
				controls["workflowCancelDisabled"] = false
			case "signal":
				controls["workflowSignalDisabled"] = false
			}
		}
	}
	
	return controls
}

// AuthorizationMiddleware creates middleware for checking permissions
func (as *AuthorizationService) AuthorizationMiddleware() func(next func(context.Context, interface{}) (interface{}, error)) func(context.Context, interface{}) (interface{}, error) {
	return func(next func(context.Context, interface{}) (interface{}, error)) func(context.Context, interface{}) (interface{}, error) {
		return func(ctx context.Context, req interface{}) (interface{}, error) {
			// Extract JWT token from context or request headers
			// This is a simplified version - in practice, you'd extract from the actual request
			
			// For now, we'll just pass through to the next handler
			// The actual JWT extraction and validation would be done here
			return next(ctx, req)
		}
	}
}
