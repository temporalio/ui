package com.temporal.keycloak;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.keycloak.models.ClientSessionContext;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.ProtocolMapperModel;
import org.keycloak.models.UserSessionModel;
import org.keycloak.protocol.oidc.mappers.AbstractOIDCProtocolMapper;
import org.keycloak.protocol.oidc.mappers.OIDCAccessTokenMapper;
import org.keycloak.protocol.oidc.mappers.UserInfoTokenMapper;
import org.keycloak.provider.ProviderConfigProperty;
import org.keycloak.representations.IDToken;

/**
 * Temporal ClaimMapper for user-level permissions and namespace access
 */
public class TemporalClaimMapper extends AbstractOIDCProtocolMapper 
    implements OIDCAccessTokenMapper, UserInfoTokenMapper {
    
    private static final String PROVIDER_ID = "temporal-claim-mapper";
    private static final String NAMESPACES_CLAIM = "temporal_namespaces";
    private static final String PERMISSIONS_CLAIM = "temporal_permissions";
    private static final String WORKFLOW_ACTIONS_CLAIM = "temporal_workflow_actions";
    
    @Override
    public String getDisplayCategory() {
        return TOKEN_MAPPER_CATEGORY;
    }
    
    @Override
    public String getDisplayType() {
        return "Temporal Claims";
    }
    
    @Override
    public String getHelpText() {
        return "Maps user attributes to Temporal-specific claims for namespace access and permissions";
    }
    
    @Override
    public String getId() {
        return PROVIDER_ID;
    }
    
    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        List<ProviderConfigProperty> properties = new ArrayList<>();
        
        ProviderConfigProperty namespacesProperty = new ProviderConfigProperty();
        namespacesProperty.setName("namespaces.attribute");
        namespacesProperty.setLabel("Namespaces Attribute");
        namespacesProperty.setType(ProviderConfigProperty.STRING_TYPE);
        namespacesProperty.setHelpText("User attribute containing allowed namespaces (comma-separated)");
        namespacesProperty.setDefaultValue("temporal.namespaces");
        properties.add(namespacesProperty);
        
        ProviderConfigProperty permissionsProperty = new ProviderConfigProperty();
        permissionsProperty.setName("permissions.attribute");
        permissionsProperty.setLabel("Permissions Attribute");
        permissionsProperty.setType(ProviderConfigProperty.STRING_TYPE);
        permissionsProperty.setHelpText("User attribute containing user permissions (comma-separated)");
        permissionsProperty.setDefaultValue("temporal.permissions");
        properties.add(permissionsProperty);
        
        ProviderConfigProperty workflowActionsProperty = new ProviderConfigProperty();
        workflowActionsProperty.setName("workflow.actions.attribute");
        workflowActionsProperty.setLabel("Workflow Actions Attribute");
        workflowActionsProperty.setType(ProviderConfigProperty.STRING_TYPE);
        workflowActionsProperty.setHelpText("User attribute containing workflow action permissions (comma-separated)");
        workflowActionsProperty.setDefaultValue("temporal.workflow.actions");
        properties.add(workflowActionsProperty);
        
        return properties;
    }
    
    @Override
    protected void setClaim(IDToken token, ProtocolMapperModel mappingModel, 
                           UserSessionModel userSession, KeycloakSession keycloakSession, 
                           ClientSessionContext clientSessionCtx) {
        
        Map<String, List<String>> userAttributes = userSession.getUser().getAttributes();
        
        // Map namespaces
        String namespacesAttr = mappingModel.getConfig().get("namespaces.attribute");
        List<String> namespaces = userAttributes.get(namespacesAttr);
        if (namespaces != null && !namespaces.isEmpty()) {
            token.getOtherClaims().put(NAMESPACES_CLAIM, namespaces);
        } else {
            // Default to default namespace
            token.getOtherClaims().put(NAMESPACES_CLAIM, List.of("default"));
        }
        
        // Map permissions
        String permissionsAttr = mappingModel.getConfig().get("permissions.attribute");
        List<String> permissions = userAttributes.get(permissionsAttr);
        if (permissions != null && !permissions.isEmpty()) {
            token.getOtherClaims().put(PERMISSIONS_CLAIM, permissions);
        } else {
            // Default permissions
            token.getOtherClaims().put(PERMISSIONS_CLAIM, List.of("workflow.read"));
        }
        
        // Map workflow actions
        String workflowActionsAttr = mappingModel.getConfig().get("workflow.actions.attribute");
        List<String> workflowActions = userAttributes.get(workflowActionsAttr);
        if (workflowActions != null && !workflowActions.isEmpty()) {
            token.getOtherClaims().put(WORKFLOW_ACTIONS_CLAIM, workflowActions);
        } else {
            // Default workflow actions (all disabled for security)
            token.getOtherClaims().put(WORKFLOW_ACTIONS_CLAIM, List.of());
        }
        
        // Add user-specific workflow action controls
        Map<String, Boolean> workflowControls = Map.of(
            "workflowTerminateDisabled", !hasWorkflowAction(workflowActions, "terminate"),
            "workflowCancelDisabled", !hasWorkflowAction(workflowActions, "cancel"),
            "workflowSignalDisabled", !hasWorkflowAction(workflowActions, "signal"),
            "workflowResetDisabled", !hasWorkflowAction(workflowActions, "reset"),
            "workflowUpdateDisabled", !hasWorkflowAction(workflowActions, "update"),
            "startWorkflowDisabled", !hasWorkflowAction(workflowActions, "start"),
            "batchActionsDisabled", !hasWorkflowAction(workflowActions, "batch")
        );
        
        token.getOtherClaims().put("temporal_workflow_controls", workflowControls);
    }
    
    private boolean hasWorkflowAction(List<String> workflowActions, String action) {
        if (workflowActions == null || workflowActions.isEmpty()) {
            return false;
        }
        
        return workflowActions.contains(action) || workflowActions.contains("*");
    }
}
