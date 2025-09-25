import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = forwardRef(({ value, onChange }, ref) => {
  const editorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    insertText: (text) => {
      if (editorRef.current) {
        editorRef.current.insertContent(text);
      }
    },
    getContent: () => editorRef.current?.getContent() || '',
    setContent: (content) => {
      editorRef.current?.setContent(content);
    },
  }));

  return (
    <Editor
      apiKey="roscqmhk6kdun9s0p9vzdkpda8aqbkzbn3k83kqjd2e14mnz"
      onInit={(evt, editor) => {
        editorRef.current = editor;
      }}
      value={value || ''}
      onEditorChange={onChange}
      init={{
        height: 300,
        menubar: true,
        plugins: [
          'insertdatetime',
          'media',
          'table',
          'paste',
          'code',
          'help',
          'wordcount',
        ],
        toolbar:
          'undo redo | formatselect | ' +
          'bold italic underline code | alignleft aligncenter alignright alignjustify | ' +
          'bullist numlist outdent indent | removeformat | help',
        content_style:
          'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
      }}
    />
  );
});

export default RichTextEditor;
