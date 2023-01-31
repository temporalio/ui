// The MIT License
//
// Copyright (c) 2020 Temporal Technologies Inc.  All rights reserved.
//
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

package fs_config_provider

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"gopkg.in/validator.v2"
	"gopkg.in/yaml.v3"

	"github.com/temporalio/ui-server/v2/server/config"
)

const (
	// EnvKeyRoot the environment variable key for runtime root dir
	EnvKeyRoot = "TEMPORAL_ROOT"
	// EnvKeyConfigDir the environment variable key for config dir
	EnvKeyConfigDir = "TEMPORAL_CONFIG_DIR"
	// EnvKeyEnvironment is the environment variable key for environment
	EnvKeyEnvironment = "TEMPORAL_ENVIRONMENT"
)

const (
	baseFile         = "base.yaml"
	envDevelopment   = "development"
	defaultConfigDir = "config"
)

// Load loads the configuration from a set of
// yaml config files found in the config directory
//
// The loader first fetches the set of files matching
// a pre-determined naming convention, then sorts
// them by hierarchy order and after that, simply
// loads the files one after another with the
// key/values in the later files overriding the key/values
// in the earlier files
//
// The hierarchy is as follows from lowest to highest
//
//   base.yaml
//       env.yaml   -- environment is one of the input params ex-development
//
func Load(configDir string, config interface{}, env string) error {
	if len(env) == 0 {
		env = envDevelopment
	}
	if len(configDir) == 0 {
		configDir = defaultConfigDir
	}

	log.Printf("Loading config; env=%v,configDir=%v\n", env, configDir)

	files, err := getConfigFiles(configDir, env)
	if err != nil {
		return err
	}

	log.Printf("Loading config files=%v\n", files)

	for _, f := range files {
		// This is tagged nosec because the file names being read are for config files that are not user supplied
		// #nosec
		data, err := ioutil.ReadFile(f)
		if err != nil {
			return err
		}
		err = yaml.Unmarshal(data, config)
		if err != nil {
			return err
		}
	}

	return validator.Validate(config)
}

// Helper function for loading configuration
func LoadConfig(configDir string, env string) (*config.Config, error) {
	config := config.Config{}
	err := Load(configDir, &config, env)
	if err != nil {
		return nil, fmt.Errorf("config file corrupted: %w", err)
	}
	return &config, nil
}

// getConfigFiles returns the list of config files to
// process in the hierarchy order
func getConfigFiles(configDir string, env string) ([]string, error) {

	candidates := []string{
		path(configDir, baseFile),
		path(configDir, file(env, "yaml")),
	}

	var result []string

	for _, c := range candidates {
		if _, err := os.Stat(c); err != nil {
			continue
		}
		result = append(result, c)
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("no config files found within %v", configDir)
	}

	return result, nil
}

func file(name string, suffix string) string {
	return name + "." + suffix
}

func path(dir string, file string) string {
	return dir + "/" + file
}
