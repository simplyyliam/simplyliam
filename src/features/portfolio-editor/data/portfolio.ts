import { supabase } from "@/lib/supabase";
import type {
  PortfolioDocument,
  PortfolioDocumentRecord,
  PortfolioDocumentStatus,
} from "../types/portfolio";
import { isPortfolioDocument } from "../validation/portfolio";
import { defaultPortfolioDocument } from "./defaultPortfolio";

interface PortfolioDocumentRow {
  id: string;
  page_id: string;
  status: PortfolioDocumentStatus;
  document: PortfolioDocument;
  revision: number;
  updated_at: string;
}

const portfolioColumns =
  "id, page_id, status, document, revision, updated_at";

function mapPortfolioDocument(
  row: PortfolioDocumentRow,
): PortfolioDocumentRecord {
  if (!isPortfolioDocument(row.document)) {
    throw new Error("The portfolio document has an invalid structure.");
  }

  return {
    id: row.id,
    pageId: row.page_id,
    status: row.status,
    document: row.document,
    revision: row.revision,
    updatedAt: row.updated_at,
  };
}

export async function getPortfolioDocument(
  status: PortfolioDocumentStatus = "published",
): Promise<PortfolioDocumentRecord> {
  if (!supabase) {
    return {
      id: `${status}-fallback`,
      pageId: "main",
      status,
      document: defaultPortfolioDocument,
      revision: 1,
      updatedAt: new Date(0).toISOString(),
    };
  }

  const { data, error } = await supabase
    .from("portfolio_documents")
    .select(portfolioColumns)
    .eq("page_id", "main")
    .eq("status", status)
    .single();

  if (error) {
    throw error;
  }

  return mapPortfolioDocument(data as PortfolioDocumentRow);
}

export async function updatePortfolioDocument(
  record: PortfolioDocumentRecord,
  document: PortfolioDocument,
): Promise<PortfolioDocumentRecord> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("portfolio_documents")
    .update({
      document,
      revision: record.revision + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", record.id)
    .eq("revision", record.revision)
    .select(portfolioColumns)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "This portfolio version changed elsewhere. Refresh before trying again.",
    );
  }

  return mapPortfolioDocument(data as PortfolioDocumentRow);
}
