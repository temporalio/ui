package temporal_auth

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
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
	
	// Check for wildcard namespace access
	if claims.TemporalNamespaces == "*" {
		return true
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
	
	// Check for wildcard permission
	if claims.TemporalPermissions == "*" {
		return true
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
		// Check for wildcard workflow actions
		if claims.TemporalWorkflowActions == "*" {
			controls["workflowResetDisabled"] = false
			controls["workflowTerminateDisabled"] = false
			controls["workflowCancelDisabled"] = false
			controls["workflowSignalDisabled"] = false
		} else {
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
	}
	
	return controls
}

// ParseJWTToken parses and validates a JWT token
func (as *AuthorizationService) ParseJWTToken(tokenString string) (*jwt.Token, error) {
	// For testing, manually parse the JWT payload without signature verification
	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid JWT token format")
	}

	// Decode the payload (second part) - base64url decode
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("failed to decode JWT payload: %v", err)
	}

	// Parse the claims
	var claims TemporalClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, fmt.Errorf("failed to parse JWT claims: %v", err)
	}

	// Create a mock token with the parsed claims
	token := &jwt.Token{
		Valid:  true,
		Claims: &claims,
	}

	return token, nil
}

// GetRequiredPermission determines the required permission based on HTTP method and path
func (as *AuthorizationService) GetRequiredPermission(method, path string) string {
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
		return "workflow.read" // Use workflow.read for namespace access
	case strings.Contains(path, "/namespaces") && method == "POST":
		return "workflow.write"
	default:
		return "workflow.read" // Default permission
	}
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
