package auth

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestAdditionalClaimsError(t *testing.T) {
	configAdditionalClaims := map[string]string{
		"foo": "bar",
	}
	claimTokenValues := map[string]interface{}{
		"foo":   []interface{}{"value1", "value2", "value3"},
		"group": []interface{}{"value1", "value2", "bar"},
	}
	err := VerifyAdditionalClaims(configAdditionalClaims, claimTokenValues)
	assert.Error(t, err)
}

func TestAdditionalClaimsSuccess(t *testing.T) {
	configAdditionalClaims := map[string]string{
		"group": "bar",
	}
	claimTokenValues := map[string]interface{}{
		"foo":   []interface{}{"value1", "value2", "value3"},
		"group": []interface{}{"value1", "value2", "bar"},
	}
	err := VerifyAdditionalClaims(configAdditionalClaims, claimTokenValues)
	assert.NoError(t, err)
}
