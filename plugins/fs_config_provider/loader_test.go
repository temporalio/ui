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
	"io/ioutil"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
)

const fileMode = os.FileMode(0644)

type (
	LoaderSuite struct {
		*require.Assertions
		suite.Suite
	}

	itemsConfig struct {
		Item1 string `yaml:"item1"`
		Item2 string `yaml:"item2"`
	}

	testConfig struct {
		Items itemsConfig `yaml:"items"`
	}
)

func TestLoaderSuite(t *testing.T) {
	suite.Run(t, new(LoaderSuite))
}

func (s *LoaderSuite) SetupTest() {
	s.Assertions = require.New(s.T())
}

func (s *LoaderSuite) TestBaseYaml() {

	dir, err := ioutil.TempDir("", "loader.testBaseYaml")
	s.Nil(err)
	defer os.RemoveAll(dir)

	data := buildConfig("")
	err = ioutil.WriteFile(path(dir, "base.yaml"), []byte(data), fileMode)
	s.Nil(err)

	envs := []string{"", "prod"}

	for _, env := range envs {
		var cfg testConfig
		err = Load(dir, &cfg, env)
		s.Nil(err)
		s.Equal("hello_", cfg.Items.Item1)
		s.Equal("world_", cfg.Items.Item2)
	}
}

func (s *LoaderSuite) TestHierarchy() {
	dir, err := ioutil.TempDir("", "loader.testHierarchy")
	s.Nil(err)
	defer os.RemoveAll(dir)

	s.createFile(dir, "base.yaml", "")
	s.createFile(dir, "development.yaml", "development")
	s.createFile(dir, "prod.yaml", "prod")
	s.createFile(dir, "prod_dca.yaml", "prod")

	testCases := []struct {
		env   string
		item1 string
		item2 string
	}{
		{"", "hello_development", "world_development"},
		{"development", "hello_development", "world_development"},
		{"prod", "hello_prod", "world_prod"},
	}

	for _, tc := range testCases {
		var cfg testConfig
		err = Load(dir, &cfg, tc.env)
		s.Nil(err)
		s.Equal(tc.item1, cfg.Items.Item1)
		s.Equal(tc.item2, cfg.Items.Item2)
	}
}

func (s *LoaderSuite) TestInvalidPath() {
	var cfg testConfig
	err := Load("", &cfg, "prod")
	s.NotNil(err)
}

func (s *LoaderSuite) createFile(dir string, file string, env string) {
	err := ioutil.WriteFile(path(dir, file), []byte(buildConfig(env)), fileMode)
	s.Nil(err)
}

func buildConfig(env string) string {
	item1 := "hello_" + env
	item2 := "world_" + env
	return `
    items:
      item1: ` + item1 + `
      item2: ` + item2
}
