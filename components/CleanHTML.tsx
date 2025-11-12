"use client";

export default function CleanHTML({ html }: { html: string }) {
  return (
    <div
      className="prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
