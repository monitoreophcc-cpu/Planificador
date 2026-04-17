import { createClient } from '@/lib/supabase/client';
import type { ManualRepresentativeLink } from '@/ui/reports/analysis-beta/services/representative-link.service';

const LINK_TABLE = 'call_center_manual_representative_links';

type ManualRepresentativeLinkRow = {
  user_id: string;
  agent_name: string;
  representative_name: string;
  updated_at: string;
};

function isMissingLinkTableError(error: unknown): boolean {
  if (!(error instanceof Error) && typeof error !== 'object') {
    return false;
  }

  const message =
    error instanceof Error
      ? error.message
      : String((error as { message?: unknown }).message ?? '');

  return message.toLowerCase().includes(LINK_TABLE);
}

export function buildManualRepresentativeLinkRows(params: {
  userId: string;
  links: ManualRepresentativeLink[];
}): ManualRepresentativeLinkRow[] {
  const updatedAt = new Date().toISOString();

  return [...params.links]
    .sort((left, right) => left.agentName.localeCompare(right.agentName, 'es'))
    .map((link) => ({
      user_id: params.userId,
      agent_name: link.agentName,
      representative_name: link.representativeName,
      updated_at: updatedAt,
    }));
}

export async function loadManualRepresentativeLinksFromSupabase(
  userId: string
): Promise<ManualRepresentativeLink[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(LINK_TABLE)
    .select('agent_name, representative_name')
    .eq('user_id', userId)
    .order('agent_name', { ascending: true });

  if (error) {
    if (isMissingLinkTableError(error)) {
      return [];
    }

    throw error;
  }

  return (data ?? []).map((row) => ({
    agentName: String((row as { agent_name: string }).agent_name),
    representativeName: String(
      (row as { representative_name: string }).representative_name
    ),
  }));
}

export async function syncManualRepresentativeLinksToSupabase(params: {
  userId: string;
  links: ManualRepresentativeLink[];
}): Promise<void> {
  const supabase = createClient();
  const rows = buildManualRepresentativeLinkRows(params);
  const { data: remoteRows, error: remoteError } = await supabase
    .from(LINK_TABLE)
    .select('agent_name')
    .eq('user_id', params.userId);

  if (remoteError) {
    if (isMissingLinkTableError(remoteError)) {
      return;
    }

    throw remoteError;
  }

  if (rows.length === 0) {
    const { error } = await supabase
      .from(LINK_TABLE)
      .delete()
      .eq('user_id', params.userId);

    if (error) {
      throw error;
    }

    return;
  }

  const { error: upsertError } = await supabase
    .from(LINK_TABLE)
    .upsert(rows, { onConflict: 'user_id,agent_name' });

  if (upsertError) {
    if (isMissingLinkTableError(upsertError)) {
      return;
    }

    throw upsertError;
  }

  const localAgentNames = new Set(rows.map((row) => row.agent_name));
  const agentNamesToDelete = (remoteRows ?? [])
    .map((row) => String((row as { agent_name: string }).agent_name))
    .filter((agentName) => !localAgentNames.has(agentName));

  if (agentNamesToDelete.length === 0) {
    return;
  }

  const { error: deleteError } = await supabase
    .from(LINK_TABLE)
    .delete()
    .eq('user_id', params.userId)
    .in('agent_name', agentNamesToDelete);

  if (deleteError) {
    throw deleteError;
  }
}
