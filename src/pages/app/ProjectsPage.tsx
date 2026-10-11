import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, Plus, ArrowRight, Wallet, Users, Calendar } from 'lucide-react';
import { useFairwork } from '../../context/FairworkContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatMoney } from '../../core/money';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, milestones, allUsers, currentUser } = useFairwork();

  const isClient = currentUser.role === 'CLIENT';

  // In accordance with RLS rules: Clients and Freelancers only view projects they participate in; Arbitrators/Admins view all
  const accessibleProjects = projects.filter((p) => {
    if (currentUser.role === 'ARBITRATOR' || currentUser.role === 'ADMIN') return true;
    return p.clientId === currentUser.id || p.freelancerId === currentUser.id;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
            Projects &amp; Agreements
          </h1>
          <p className="text-xs text-[#605A53] mt-0.5">
            Manage verifiable milestone contracts, deliverables, and escrow vaults
          </p>
        </div>

        {isClient && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate('/app/projects/new')}
          >
            Create New Project
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accessibleProjects.map((project) => {
          const projectMilestones = milestones.filter((m) => m.projectId === project.id);
          const completedCount = projectMilestones.filter((m) => m.status === 'RELEASED').length;
          const clientName = allUsers[project.clientId]?.displayName ?? 'Client';
          const freelancerName = allUsers[project.freelancerId]?.displayName ?? 'Freelancer';

          return (
            <Card
              key={project.id}
              interactive
              onClick={() => navigate(`/app/projects/${project.id}`)}
              className="p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <StatusBadge status={project.status} size="sm" />
                  <span className="text-xs font-mono font-bold text-[#1C1917]">
                    {formatMoney(project.totalBudgetMinor, project.currency)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1C1917] tracking-tight mb-1">
                  {project.title}
                </h3>
                <p className="text-xs text-[#605A53] line-clamp-2 mb-4">
                  {project.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-t border-b border-[#EFECE6] mb-4 text-[#605A53]">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#8A837A]" />
                    <span>{clientName} &bull; {freelancerName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8A837A]" />
                    <span>Target: {project.targetCompletionDate || 'Open'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#8A837A] font-medium">
                  {completedCount} / {projectMilestones.length} milestones released
                </span>
                <span className="text-[#264235] font-semibold flex items-center gap-1">
                  Open Project <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
