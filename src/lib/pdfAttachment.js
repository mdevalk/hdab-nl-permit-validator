import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

// open-daams embeds the signed digital permit as a `<permitId>.json` file
// attachment inside the issued PDF (see generate-permit-pdf.ts) — the PDF is
// just a rendering of that JSON. Pull it back out so the same permit object
// the rest of this app already knows how to verify can be read from a PDF.
export async function extractPermitJsonFromPdf(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const attachments = await pdf.getAttachments()
  const filenames = [...attachments.keys()]
  if (filenames.length === 0) {
    throw new Error('This PDF has no embedded digital permit attachment.')
  }
  const filename = filenames.find(f => f.toLowerCase().endsWith('.json')) || filenames[0]
  const content = await pdf.getAttachmentContent(filename)
  const text = new TextDecoder('utf-8').decode(content)
  return JSON.parse(text)
}
