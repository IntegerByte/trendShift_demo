import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import PropTypes from "prop-types";
import { cmsApi } from "../services/cmsApi";

function ToolbarButton({ active, disabled, onClick, label, children }) {
  return (
    <button
      type="button"
      className={active ? "cms-richtext__btn is-active" : "cms-richtext__btn"}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

ToolbarButton.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// Controlled rich text editor (HTML string in, HTML string out) backed by
// TipTap, used for every CKEditor5Field on the backend (ExpertiseArea /
// Page / CaseStudy short_description + description). Images are uploaded
// through the CMS media endpoint (cmsApi.uploadMedia) rather than embedded
// as base64, so stored HTML stays small and images are served as normal
// media files.
export default function RichTextEditor({ value, onChange }) {
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
    ],
    content: value || "",
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    editorProps: {
      attributes: { class: "cms-richtext__content" },
    },
  });

  // Keep the editor in sync when the parent swaps records (e.g. opening a
  // different row's edit modal) without fighting the user's own typing.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current) {
      editor.commands.setContent(next, false);
    }
  }, [editor, value]);

  async function insertImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) return;
    try {
      const { url } = await cmsApi.uploadMedia(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      window.alert(err.message || "Could not upload that image.");
    }
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href || "";
    const url = window.prompt("Link URL", previous);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div className="cms-richtext">
      <div className="cms-richtext__toolbar">
        <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          S
        </ToolbarButton>
        <span className="cms-richtext__sep" />
        <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarButton>
        <span className="cms-richtext__sep" />
        <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          ••
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          12
        </ToolbarButton>
        <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          &ldquo;
        </ToolbarButton>
        <span className="cms-richtext__sep" />
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          🔗
        </ToolbarButton>
        <ToolbarButton label="Image" onClick={() => fileInputRef.current?.click()}>
          🖼
        </ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={insertImage} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
