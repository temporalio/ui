package com.temporal.keycloak;

import java.io.ObjectInputFilter.Config;
import java.util.List;

import org.keycloak.authorization.AuthorizationProvider;
import org.keycloak.authorization.AuthorizationProviderFactory;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.representations.idm.ProtocolMapperRepresentation;

/**
 * Temporal Provider for Keycloak plugins
 */
public class TemporalProvider implements AuthorizationProviderFactory {
    
    @Override
    public AuthorizationProvider create(KeycloakSession session) {
        return new TemporalAuthorizationProvider(session);
    }
    
    @Override
    public void init(Config.Scope config) {
        // Initialize provider
    }
    
    @Override
    public void postInit(KeycloakSessionFactory factory) {
        // Post-initialization
    }
    
    @Override
    public void close() {
        // Cleanup
    }
    
    @Override
    public String getId() {
        return "temporal-provider";
    }
    
    /**
     * Create default protocol mapper for Temporal claims
     */
    public static ProtocolMapperRepresentation createTemporalClaimMapper() {
        ProtocolMapperRepresentation mapper = new ProtocolMapperRepresentation();
        mapper.setName("Temporal Claims Mapper");
        mapper.setProtocol("openid-connect");
        mapper.setProtocolMapper(TemporalClaimMapper.PROVIDER_ID);
        
        // Configure mapper
        mapper.getConfig().put("namespaces.attribute", "temporal.namespaces");
        mapper.getConfig().put("permissions.attribute", "temporal.permissions");
        mapper.getConfig().put("workflow.actions.attribute", "temporal.workflow.actions");
        
        return mapper;
    }
    
    /**
     * Create user attributes for different user roles
     */
    public static class UserRoleConfig {
        
        public static void configureAdminUser(KeycloakSession session, String userId) {
            // Admin user: access to all namespaces, all permissions
            session.users().getUserById(session.getContext().getRealm(), userId)
                .setAttribute("temporal.namespaces", List.of("*"));
            session.users().getUserById(session.getContext().getRealm(), userId)
                .setAttribute("temporal.permissions", List.of("*"));
            session.users().getUserById(session.getContext().getRealm(), userId)
                .setAttribute("temporal.workflow.actions", List.of("*"));
        }
        
        public static void configureReadOnlyUser(KeycloakSession session, String userId) {
            // Read-only user: access to default namespace, read-only permissions
            session.users().getUserById(session.getContext().getRealm(), userId)
                .setAttribute("temporal.namespaces", List.of("default"));
            session.users().getUserById(session.getContext().getRealm(), userId)
                .setAttribute("temporal.permissions", List.of("workflow.read"));
            session.users().getUserById(session.getContext().getRealm(), userId)
                .setAttribute("temporal.workflow.actions", List.of());
        }
        
        public static void configureLimitedUser(KeycloakSession session, String userId, 
                                              List<String> namespaces, List<String> permissions, 
                                              List<String> workflowActions) {
            // Limited user: specific namespaces, permissions, and workflow actions
            session.users().getUserById(session.getContext().getRealm(), userId)
                .setAttribute("temporal.namespaces", namespaces);
            session.users().getUserById(session.getContext().getRealm(), userId)
                .setAttribute("temporal.permissions", permissions);
            session.users().getUserById(session.getContext().getRealm(), userId)
                .setAttribute("temporal.workflow.actions", workflowActions);
        }
    }
}
