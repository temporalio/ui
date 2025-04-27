package cmd

import (
	"fmt"
	"os"

	"devctl/app"

	"github.com/urfave/cli/v2"
)

// Execute initializes and runs the CLI application.
func Execute() {
	app := &cli.App{
		Name:  "devctl",
		Usage: "Development control tool",
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "config-dir", Aliases: []string{"c"}, Value: "configs", Usage: "Directory containing config files (env, Procfile, health)"},
			&cli.StringFlag{Name: "mode", Aliases: []string{"m"}, Value: "dev", Usage: "Mode to run (e.g., dev, prod)"},
			&cli.StringFlag{Name: "focus", Aliases: []string{"f"}, Value: "", Usage: "Service to focus on"},
			&cli.StringFlag{Name: "mute", Value: "", Usage: "Service to mute"},
			&cli.BoolFlag{Name: "tui", Usage: "Enable interactive TUI"},
		},
		Action: action,
	}

	if err := app.Run(os.Args); err != nil {
		os.Exit(1)
	}
}

// action is the main action for the CLI application.
func action(c *cli.Context) error {
	err := app.New().
		SetConfigDir(c.String("config-dir")).
		SetMode(c.String("mode")).
		SetFocus(c.String("focus")).
		SetMute(c.String("mute")).
		SetTUI(c.Bool("tui")).
		Run()

	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		return cli.Exit("", 1)
	}

	return nil
}

