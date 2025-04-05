import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PDFDocument, rgb } from "pdf-lib";

const documentos = [
  "Requerimento de inscrição da OAB-ES",
  "Requerimento de inscrição no Conselho Federal da OAB",
  "Histórico Escolar com diploma ou colação de grau (autenticado)",
  "Certidão Negativa Cartório Distribuidor Justiça Federal",
  "Certificado de Aprovação em Exame de Ordem",
  "Certidão Negativa - Cartório Distribuidor do Crime",
  "Certidão Negativa - Cartório Distribuidor do Cível",
  "Certidão Negativa - Cartório Distribuidor da Família",
  "Certidão Negativa - Cartório Distribuidor do Crime Federal 2ª Região",
  "Certidão Negativa - Cartório Distribuidor Cível Federal 2ª Região",
  "Declaração de atividade, função ou cargo (com ou sem atividade)",
  "Declaração de atividade da pessoa jurídica vinculada",
  "Certidão de quitação eleitoral",
  "RG",
  "CPF",
  "Título de Eleitor (frente/verso)",
  "Certificado de Reservista (para homens)",
  "Comprovante de residência atualizado",
  "Declaração de responsabilidade das informações"
];

export default function UploadInscricao() {
  const [arquivos, setArquivos] = useState({});

  const handleChange = (e, index) => {
    const newFiles = { ...arquivos };
    newFiles[index] = e.target.files[0];
    setArquivos(newFiles);
  };

  const handleSubmit = async () => {
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < documentos.length; i++) {
      const file = arquivos[i];
      if (!file) continue;

      if (file.type === "application/pdf") {
        const bytes = await file.arrayBuffer();
        const donorPdfDoc = await PDFDocument.load(bytes);
        const copiedPages = await pdfDoc.copyPages(donorPdfDoc, donorPdfDoc.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));
      } else if (file.type.startsWith("image/")) {
        const imageBytes = await file.arrayBuffer();
        let image;
        if (file.type === "image/jpeg") {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (file.type === "image/png") {
          image = await pdfDoc.embedPng(imageBytes);
        }
        if (image) {
          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Inscricao_OAB_ES.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Inscrição OAB-ES</h1>
      {documentos.map((doc, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-2">
            <label className="block font-semibold">{i + 1}. {doc}</label>
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleChange(e, i)} />
          </CardContent>
        </Card>
      ))}
      <Button onClick={handleSubmit}>Gerar PDF Padronizado</Button>
    </div>
  );
}
