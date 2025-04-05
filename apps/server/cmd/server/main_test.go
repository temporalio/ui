package main

import (
	"bytes"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/urfave/cli/v2"
)

func TestExitCodesWorkProperly(t *testing.T) {
	testcases := []struct {
		arguments        []string
		expectedExitCode int
		expectedText     string
	}{
		{arguments: []string{}, expectedExitCode: 0, expectedText: "USAGE"},
		{arguments: []string{"--config", "/tmp/doesnotexist123", "start"}, expectedExitCode: 1, expectedText: "no config files found"},
	}

	cli.OsExiter = func(int) {}
	for idx, tc := range testcases {
		t.Run(strconv.Itoa(idx), func(t *testing.T) {
			tc := tc

			c := buildCLI()
			c.ExitErrHandler = func(_ *cli.Context, err error) {}

			var buf bytes.Buffer
			c.Writer = &buf
			c.ErrWriter = &buf

			args := append([]string{"./ui-server"}, tc.arguments...)
			err := c.Run(args)

			if tc.expectedExitCode != 0 {
				assert.Error(t, err)
			}

			if err != nil {
				ec := err.(cli.ExitCoder)
				assert.Equal(t, tc.expectedExitCode, ec.ExitCode())
				assert.Contains(t, ec.Error(), tc.expectedText)
			} else {
				assert.Contains(t, buf.String(), tc.expectedText)
			}
		})
	}
}
