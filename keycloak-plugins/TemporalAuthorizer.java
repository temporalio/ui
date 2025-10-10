package com.temporal.keycloak;

import java.util.List;
import java.util.Map;

import org.keycloak.authorization.AuthorizationProvider;
import org.keycloak.authorization.policy.evaluation.Evaluation;
import org.keycloak.authorization.policy.evaluation.EvaluationContext;
import org.keycloak.authorization.policy.evaluation.PolicyEvaluator;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.UserModel;

/**
 * Temporal Authorizer for namespace-level access control
 */
public class TemporalAuthorizer implements PolicyEvaluator {
    
    private final KeycloakSession session;
    private final AuthorizationProvider authorizationProvider;
    
    public TemporalAuthorizer(KeycloakSession session, AuthorizationProvider authorizationProvider) {
        this.session = session;
        this.authorizationProvider = authorizationProvider;
    }
    
    @Override
    public void evaluate(Evaluation evaluation) {
        EvaluationContext context = evaluation.getContext();
        UserModel user = context.getIdentity();
        
        if (user == null) {
            evaluation.deny();
            return;
        }
        
        // Get user attributes for namespace access
        Map<String, List<String>> userAttributes = user.getAttributes();
        List<String> allowedNamespaces = userAttributes.get("temporal.namespaces");
        List<String> userPermissions = userAttributes.get("temporal.permissions");
        
        // Check namespace access
        String requestedNamespace = getRequestedNamespace(context);
        if (requestedNamespace != null && !isNamespaceAllowed(allowedNamespaces, requestedNamespace)) {
            evaluation.deny();
            return;
        }
        
        // Check specific permissions
        String requestedPermission = getRequestedPermission(context);
        if (requestedPermission != null && !isPermissionAllowed(userPermissions, requestedPermission)) {
            evaluation.deny();
            return;
        }
        
        evaluation.grant();
    }
    
    private String getRequestedNamespace(EvaluationContext context) {
        // Extract namespace from the request context
        // This could be from headers, query parameters, or request body
        Map<String, Object> attributes = context.getAttributes();
        
        // Check for namespace in headers
        Object namespaceHeader = attributes.get("namespace");
        if (namespaceHeader != null) {
            return namespaceHeader.toString();
        }
        
        // Check for namespace in request URI
        Object requestUri = attributes.get("request.uri");
        if (requestUri != null) {
            String uri = requestUri.toString();
            // Extract namespace from URI patterns like /api/namespaces/{namespace}/workflows
            if (uri.contains("/namespaces/")) {
                String[] parts = uri.split("/namespaces/");
                if (parts.length > 1) {
                    String[] remaining = parts[1].split("/");
                    return remaining[0];
                }
            }
        }
        
        return "default"; // Default namespace if not specified
    }
    
    private String getRequestedPermission(EvaluationContext context) {
        // Extract permission from the request context
        Map<String, Object> attributes = context.getAttributes();
        
        Object method = attributes.get("request.method");
        Object uri = attributes.get("request.uri");
        
        if (method != null && uri != null) {
            String methodStr = method.toString();
            String uriStr = uri.toString();
            
            // Map HTTP methods and URIs to Temporal permissions
            if ("POST".equals(methodStr)) {
                if (uriStr.contains("/workflows/") && uriStr.contains("/terminate")) {
                    return "workflow.terminate";
                } else if (uriStr.contains("/workflows/") && uriStr.contains("/cancel")) {
                    return "workflow.cancel";
                } else if (uriStr.contains("/workflows/") && uriStr.contains("/signal")) {
                    return "workflow.signal";
                } else if (uriStr.contains("/workflows/") && uriStr.contains("/reset")) {
                    return "workflow.reset";
                } else if (uriStr.contains("/workflows/") && uriStr.contains("/update")) {
                    return "workflow.update";
                } else if (uriStr.contains("/workflows")) {
                    return "workflow.start";
                }
            } else if ("GET".equals(methodStr)) {
                return "workflow.read";
            }
        }
        
        return "workflow.read"; // Default permission
    }
    
    private boolean isNamespaceAllowed(List<String> allowedNamespaces, String requestedNamespace) {
        if (allowedNamespaces == null || allowedNamespaces.isEmpty()) {
            return "default".equals(requestedNamespace);
        }
        
        return allowedNamespaces.contains(requestedNamespace) || 
               allowedNamespaces.contains("*"); // Wildcard for all namespaces
    }
    
    private boolean isPermissionAllowed(List<String> userPermissions, String requestedPermission) {
        if (userPermissions == null || userPermissions.isEmpty()) {
            return "workflow.read".equals(requestedPermission);
        }
        
        return userPermissions.contains(requestedPermission) || 
               userPermissions.contains("*"); // Wildcard for all permissions
    }
    
    @Override
    public void close() {
        // Cleanup if needed
    }
}
