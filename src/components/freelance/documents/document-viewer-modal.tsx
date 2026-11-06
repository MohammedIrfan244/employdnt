"use client";

import React from "react";
import Button from "@/components/ui/button";
import { X, Printer, FileText, CheckCircle2 } from "lucide-react";
import {
  ISowDocumentData,
  IContractDocumentData,
  IHandoverDocumentData,
} from "@/types/freelance-client";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "sow" | "contract" | "handover";
  data: ISowDocumentData | IContractDocumentData | IHandoverDocumentData | null;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  title,
  type,
  data,
}: DocumentViewerModalProps) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    const printElement = document.getElementById("printable-doc-paper");
    if (!printElement) {
      window.print();
      return;
    }

    // Create an isolated hidden iframe for clean 1-page/exact printing without parent scroll DOM duplication
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #18181b;
              background: #ffffff;
              font-size: 10.5pt;
              line-height: 1.45;
              padding: 5mm;
            }
            .space-y-6 > * + * { margin-top: 1.25rem; }
            .space-y-5 > * + * { margin-top: 1rem; }
            .space-y-4 > * + * { margin-top: 0.85rem; }
            .space-y-3 > * + * { margin-top: 0.65rem; }
            .space-y-2 > * + * { margin-top: 0.45rem; }
            .space-y-1\\.5 > * + * { margin-top: 0.35rem; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-0\\.5 > * + * { margin-top: 0.125rem; }

            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .gap-4 { gap: 1rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-2 { gap: 0.5rem; }
            .gap-8 { gap: 2rem; }

            .border { border: 1px solid #e4e4e7; }
            .border-b { border-bottom: 1px solid #e4e4e7; }
            .border-b-2 { border-bottom: 2px solid #18181b; }
            .border-t-2 { border-top: 2px solid #18181b; }
            .border-zinc-900 { border-color: #18181b; }
            .border-zinc-200 { border-color: #e4e4e7; }
            .border-zinc-400 { border-color: #a1a1aa; }

            .p-4 { padding: 0.85rem; }
            .p-3 { padding: 0.65rem; }
            .p-2\\.5 { padding: 0.5rem; }
            .pb-4 { padding-bottom: 0.85rem; }
            .pb-1 { padding-bottom: 0.25rem; }
            .pt-10 { padding-top: 1.5rem; }
            .rounded { border-radius: 0.25rem; }
            .rounded-lg { border-radius: 0.375rem; }

            .bg-zinc-50 { background-color: #f8fafc; }
            .text-zinc-950 { color: #09090b; }
            .text-zinc-900 { color: #18181b; }
            .text-zinc-800 { color: #27272a; }
            .text-zinc-700 { color: #3f3f46; }
            .text-zinc-600 { color: #52525b; }
            .text-zinc-500 { color: #71717a; }
            .text-emerald-700 { color: #047857; }

            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.85rem; }
            .text-base { font-size: 0.95rem; }
            .text-2xl { font-size: 1.35rem; }

            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .tracking-widest { letter-spacing: 0.1em; }
            .tracking-wider { letter-spacing: 0.05em; }
            .tracking-tight { letter-spacing: -0.025em; }
            .italic { font-style: italic; }
            .font-serif { font-family: Georgia, Cambria, "Times New Roman", Times, serif; }
            .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }

            .flex { display: flex; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .items-end { align-items: flex-end; }
            .justify-between { justify-content: space-between; }
            .block { display: block; }
            .h-10 { height: 2rem; }
            .whitespace-pre-wrap { white-space: pre-wrap; }
            .break-all { word-break: break-all; }
            .divide-y > * + * { border-top: 1px solid #e4e4e7; }
            ul { padding-left: 1.25rem; list-style-type: disc; }
            li { margin-bottom: 0.2rem; }
            svg { display: inline-block; vertical-align: middle; }
          </style>
        </head>
        <body>
          ${printElement.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      {/* Container */}
      <div className="w-full max-w-4xl bg-zinc-900 border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header (hidden on print) */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-zinc-950/60 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-zinc-900 print:p-0 print:m-0 print:overflow-visible font-sans leading-relaxed text-sm">
          <div id="printable-doc-paper" className="print-container max-w-3xl mx-auto space-y-6">
            {/* Document Header */}
            <div className="border-b-2 border-zinc-900 pb-4 flex justify-between items-start gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold block mb-1">
                  Freelance Engineering Agreement
                </span>
                <h1 className="text-2xl font-black tracking-tight text-zinc-950 uppercase">
                  {type === "sow" && "Statement of Work (SOW)"}
                  {type === "contract" && "Freelance Services Agreement"}
                  {type === "handover" && "Project Handover & Acceptance Spec"}
                </h1>
                <p className="text-sm font-semibold text-zinc-700 mt-1">
                  Project: {data.projectTitle}
                </p>
              </div>

              <div className="text-right text-xs text-zinc-600 space-y-0.5">
                <p>
                  <span className="font-semibold text-zinc-800">Date:</span>{" "}
                  {"effectiveDate" in data ? data.effectiveDate : data.handoverDate}
                </p>
                <p>
                  <span className="font-semibold text-zinc-800">Doc ID:</span> EMP-
                  {((data.projectTitle || "DOC") + (data.companyName || "CLIENT"))
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .slice(0, 6)
                    .toUpperCase() || "ENG01"}
                </p>
              </div>
            </div>

            {/* Parties Metadata Table */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
              <div className="space-y-1">
                <span className="font-bold text-zinc-500 uppercase tracking-wider block">
                  Service Provider (Developer)
                </span>
                <p className="font-bold text-sm text-zinc-950">{data.developerName}</p>
                {data.developerEmail && (
                  <p className="text-zinc-600">{data.developerEmail}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-bold text-zinc-500 uppercase tracking-wider block">
                  Client Organization
                </span>
                <p className="font-bold text-sm text-zinc-950">{data.companyName}</p>
                <p className="text-zinc-700">Attn: {data.clientName}</p>
              </div>
            </div>

            {/* TYPE 1: SOW DOCUMENT CONTENT */}
            {type === "sow" && (
              <div className="space-y-5">
                <section className="space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
                    1. Project Overview &amp; Objective
                  </h3>
                  <p className="text-zinc-800 leading-relaxed whitespace-pre-wrap">
                    {(data as ISowDocumentData).projectOverview}
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
                    2. In-Scope Core Deliverables
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-zinc-800">
                    {(data as ISowDocumentData).coreDeliverables?.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                {(data as ISowDocumentData).outOfScope?.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
                      3. Out of Scope (Explicit Boundaries)
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-zinc-600">
                      {(data as ISowDocumentData).outOfScope.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
                    4. Investment, Timeline &amp; Payment Milestones
                  </h3>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded text-xs">
                    <div>
                      <span className="text-zinc-500 font-semibold block">Total Estimated Fee:</span>
                      <span className="text-base font-bold text-zinc-950">
                        ₹{(data as ISowDocumentData).estimatedBudget?.toLocaleString("en-IN")}{" "}
                        {(data as ISowDocumentData).currency || "INR"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-semibold block">Estimated Timeline:</span>
                      <span className="font-semibold text-zinc-900">
                        {(data as ISowDocumentData).timelineWeeks
                          ? `${(data as ISowDocumentData).timelineWeeks} Weeks`
                          : "As outlined in sprint milestones"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700">
                    <span className="font-bold">Payment Schedule:</span>{" "}
                    {(data as ISowDocumentData).paymentTerms}
                  </p>
                  {(data as ISowDocumentData).revisionPolicy && (
                    <p className="text-xs text-zinc-700">
                      <span className="font-bold">Revisions Policy:</span>{" "}
                      {(data as ISowDocumentData).revisionPolicy}
                    </p>
                  )}
                </section>
              </div>
            )}

            {/* TYPE 2: CONTRACT DOCUMENT CONTENT */}
            {type === "contract" && (
              <div className="space-y-5">
                <section className="space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
                    1. Services Rendered
                  </h3>
                  <p className="text-zinc-800 leading-relaxed whitespace-pre-wrap">
                    {(data as IContractDocumentData).servicesDescription}
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
                    2. Compensation &amp; Terms of Payment
                  </h3>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs space-y-1">
                    <p className="text-sm font-bold text-zinc-950">
                      Agreed Total Fee: ₹{(data as IContractDocumentData).agreedAmount?.toLocaleString("en-IN")}{" "}
                      {(data as IContractDocumentData).currency || "INR"}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-bold">Schedule:</span>{" "}
                      {(data as IContractDocumentData).paymentSchedule}
                    </p>
                  </div>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
                    3. Intellectual Property Rights
                  </h3>
                  <p className="text-xs text-zinc-800 leading-relaxed">
                    {(data as IContractDocumentData).ipOwnershipClause ||
                      "Upon 100% full receipt of agreed payment, all intellectual property, source code, design assets, and copyrights created specifically for this project shall transfer unconditionally to the Client. The Developer retains the right to display the completed work in personal professional portfolios."}
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
                    4. Confidentiality &amp; Warranty
                  </h3>
                  <p className="text-xs text-zinc-800 leading-relaxed">
                    {(data as IContractDocumentData).confidentialityTerms ||
                      "Both parties agree to protect and keep confidential all proprietary business data, credentials, and codebases shared during this engagement."}
                  </p>
                  <p className="text-xs text-zinc-800 leading-relaxed pt-1">
                    The Developer warrants that the software will be free from material bugs and defects for a period of{" "}
                    <span className="font-bold">
                      {(data as IContractDocumentData).warrantyDays || 30} days
                    </span>{" "}
                    following deployment.
                  </p>
                </section>
              </div>
            )}

            {/* TYPE 3: HANDOVER DOCUMENT CONTENT */}
            {type === "handover" && (
              <div className="space-y-5">
                <section className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
                    1. System URLs &amp; Code Access
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded">
                      <span className="font-semibold text-zinc-500 block">Production URL:</span>
                      <span className="font-mono text-zinc-900 break-all">
                        {(data as IHandoverDocumentData).productionUrl}
                      </span>
                    </div>
                    <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded">
                      <span className="font-semibold text-zinc-500 block">Repository (Git):</span>
                      <span className="font-mono text-zinc-900 break-all">
                        {(data as IHandoverDocumentData).repositoryUrl}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
                    2. Transferred Assets &amp; Access Checklist
                  </h3>
                  <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-lg overflow-hidden text-xs">
                    {(data as IHandoverDocumentData).credentialsChecklist?.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between">
                        <span className="text-zinc-800">{item.item}</span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Transferred
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
                    3. Included Support &amp; Maintenance Terms
                  </h3>
                  <p className="text-xs text-zinc-800">
                    Complimentary bug warranty window:{" "}
                    <span className="font-bold">
                      {(data as IHandoverDocumentData).supportPeriodDays || 30} Days
                    </span>{" "}
                    {(data as IHandoverDocumentData).supportEndDate &&
                      `(Valid through ${(data as IHandoverDocumentData).supportEndDate})`}
                    .
                  </p>
                  {(data as IHandoverDocumentData).maintenanceNotes && (
                    <p className="text-xs text-zinc-700 pt-1">
                      {(data as IHandoverDocumentData).maintenanceNotes}
                    </p>
                  )}
                </section>
              </div>
            )}

            {/* Formal Signature Blocks */}
            <div className="pt-10 border-t-2 border-zinc-900 grid grid-cols-2 gap-8 text-xs">
              <div className="space-y-6">
                <span className="font-bold text-zinc-500 uppercase tracking-wider block">
                  Accepted &amp; Agreed By Developer:
                </span>
                <div className="border-b border-zinc-400 pb-1 h-10 flex items-end">
                  <span className="font-serif italic text-base text-zinc-800">
                    {data.developerName}
                  </span>
                </div>
                <div className="space-y-0.5 text-zinc-600">
                  <p className="font-semibold text-zinc-900">{data.developerName}</p>
                  <p>Service Provider</p>
                </div>
              </div>

              <div className="space-y-6">
                <span className="font-bold text-zinc-500 uppercase tracking-wider block">
                  Accepted &amp; Agreed By Client:
                </span>
                <div className="border-b border-zinc-400 pb-1 h-10 flex items-end">
                  <span className="font-serif italic text-base text-zinc-800">
                    {data.clientName}
                  </span>
                </div>
                <div className="space-y-0.5 text-zinc-600">
                  <p className="font-semibold text-zinc-900">{data.clientName}</p>
                  <p>{data.companyName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

