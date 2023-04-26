package tag

import (
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type (
	// ZapTag is the wrapper over zap.Field.
	ZapTag struct {
		// keep this field private
		field zap.Field
	}
)

// NewZapTag creates new ZapTag from zap.Field.
func NewZapTag(field zap.Field) ZapTag {
	return ZapTag{
		field: field,
	}
}

func (t ZapTag) Field() zap.Field {
	return t.field
}

func (t ZapTag) Key() string {
	return t.field.Key
}

func (t ZapTag) Value() interface{} {
	// Not for production use.
	enc := zapcore.NewMapObjectEncoder()
	t.field.AddTo(enc)
	for _, val := range enc.Fields {
		return val
	}
	return nil
}

func NewBinaryTag(key string, value []byte) ZapTag {
	return ZapTag{
		field: zap.Binary(key, value),
	}
}

func NewStringTag(key string, value string) ZapTag {
	return ZapTag{
		field: zap.String(key, value),
	}
}

func NewStringsTag(key string, value []string) ZapTag {
	return ZapTag{
		field: zap.Strings(key, value),
	}
}

func NewInt64(key string, value int64) ZapTag {
	return ZapTag{
		field: zap.Int64(key, value),
	}
}

func NewInt(key string, value int) ZapTag {
	return ZapTag{
		field: zap.Int(key, value),
	}
}

func NewInt32(key string, value int32) ZapTag {
	return ZapTag{
		field: zap.Int32(key, value),
	}
}

func NewBoolTag(key string, value bool) ZapTag {
	return ZapTag{
		field: zap.Bool(key, value),
	}
}

func NewErrorTag(value error) ZapTag {
	// NOTE: zap already chosen "error" as key
	return ZapTag{
		field: zap.Error(value),
	}
}

func NewDurationTag(key string, value time.Duration) ZapTag {
	return ZapTag{
		field: zap.Duration(key, value),
	}
}

func NewTimeTag(key string, value time.Time) ZapTag {
	return ZapTag{
		field: zap.Time(key, value),
	}
}

func NewAnyTag(key string, value interface{}) ZapTag {
	return ZapTag{
		field: zap.Any(key, value),
	}
}
