package api

import (
	"encoding/json"
	"io"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"go.temporal.io/api/temporalproto"
	"google.golang.org/protobuf/proto"
)

type temporalProtoMarshaler struct {
	contentType string
	mOpts       temporalproto.CustomJSONMarshalOptions
	uOpts       temporalproto.CustomJSONUnmarshalOptions
}

type temporalProtoEncoder struct {
	mOpts  temporalproto.CustomJSONMarshalOptions
	writer io.Writer
	json   *json.Encoder
}

type temporalProtoDecoder struct {
	uOpts  temporalproto.CustomJSONUnmarshalOptions
	reader io.Reader
	json   *json.Decoder
}

func (p temporalProtoMarshaler) Marshal(v any) ([]byte, error) {
	if m, ok := v.(proto.Message); ok {
		return p.mOpts.Marshal(m)
	}

	if p.mOpts.Indent != "" {
		return json.MarshalIndent(v, "", p.mOpts.Indent)
	}

	return json.Marshal(v)
}

func (p temporalProtoMarshaler) Unmarshal(data []byte, v interface{}) error {
	if m, ok := v.(proto.Message); ok {
		return p.uOpts.Unmarshal(data, m)
	}

	return json.Unmarshal(data, v)
}

func (p temporalProtoMarshaler) NewDecoder(r io.Reader) runtime.Decoder {
	return temporalProtoDecoder{
		p.uOpts,
		r,
		json.NewDecoder(r),
	}
}

func (p temporalProtoMarshaler) NewEncoder(w io.Writer) runtime.Encoder {
	return temporalProtoEncoder{
		p.mOpts,
		w,
		json.NewEncoder(w),
	}
}

func (p temporalProtoMarshaler) ContentType(_ any) string {
	return p.contentType
}

func (d temporalProtoDecoder) Decode(v any) error {
	m, ok := v.(proto.Message)
	if !ok {
		return d.json.Decode(v)
	}

	var bs json.RawMessage
	if err := d.json.Decode(&bs); err != nil {
		return err
	}

	return d.uOpts.Unmarshal([]byte(bs), m)
}

func (e temporalProtoEncoder) Encode(v any) error {
	m, ok := v.(proto.Message)
	if !ok {
		return e.json.Encode(v)
	}

	bs, err := e.mOpts.Marshal(m)
	if err != nil {
		return err
	}

	_, err = e.writer.Write(bs)
	if err != nil {
		return err
	}
	_, err = e.writer.Write([]byte{'\n'})
	return err
}
