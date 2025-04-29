
import { useTranslation } from "@/hooks/use-translation";
import { GroupCard } from "@/components/groups/GroupCard";

interface Group {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  invite_code: string;
}

interface GroupsListProps {
  groups: Group[];
  onGroupDeleted: () => void;
}

export function GroupsList({ groups, onGroupDeleted }: GroupsListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map(group => (
        <GroupCard key={group.id} group={group} onDeleted={onGroupDeleted} />
      ))}
    </div>
  );
}
