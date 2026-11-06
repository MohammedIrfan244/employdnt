import { IOutreachTemplate, IOutreachDraft } from "@/types/outreach";

export function compileOutreachDraft(
  template: IOutreachTemplate,
  input: {
    recipientName: string;
    companyName: string;
    serviceOffered: string;
    personalizedObservation: string;
  }
): IOutreachDraft {
  const replaceTokens = (text: string) => {
    return text
      .replace(/{{recipientName}}/g, input.recipientName || "[Name]")
      .replace(/{{companyName}}/g, input.companyName || "[Company]")
      .replace(/{{serviceOffered}}/g, input.serviceOffered || "[Service]")
      .replace(
        /{{personalizedObservation}}/g,
        input.personalizedObservation || "[Your observation here]"
      );
  };

  return {
    recipientName: input.recipientName,
    companyName: input.companyName,
    serviceOffered: input.serviceOffered,
    personalizedObservation: input.personalizedObservation,
    subject: replaceTokens(template.subjectTemplate),
    body: replaceTokens(template.bodyTemplate),
    templateId: template._id,
  };
}

