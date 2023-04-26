package tag

import (
	"errors"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestErrorType(t *testing.T) {
	testData := []struct {
		err            error
		expectedResult string
	}{
		{errors.New("test"), "errors.errorString"},
		{fmt.Errorf("test"), "errors.errorString"},
	}

	for id, data := range testData {
		assert.Equal(t, data.expectedResult, ErrorType(data.err).Value().(string), "Unexpected error type in index", id)
	}
}
