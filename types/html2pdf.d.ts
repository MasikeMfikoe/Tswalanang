declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    image?: { type: string; quality: number }
    html2canvas?: { scale: number }
    jsPDF?: { unit: string; format: string; orientation: string }
  }

  interface Html2PdfInstance {
    from(element: HTMLElement): Html2PdfInstance
    save(filename?: string): Promise<void>
    set(options: Html2PdfOptions): Html2PdfInstance
    to(target: string): Html2PdfInstance
    output(type: string): Promise<any>
  }

  function html2pdf(options?: Html2PdfOptions): Html2PdfInstance

  export = html2pdf
}
