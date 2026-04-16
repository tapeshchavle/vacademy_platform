import { Users, Scroll, FileMagnifyingGlass } from '@phosphor-icons/react';
import { SidebarItemsType } from '@/types/layout-container/layout-container-types';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { RoleTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

export const SidebarItemsData: SidebarItemsType[] = [
    {
        icon: Users,
        title: `${getTerminology(RoleTerms.Learner, SystemTerms.Learner)} List`,
        id: 'student-mangement',
        to: '/evaluator-ai/students',
    },
    {
        icon: Scroll,
        title: 'Assessment Centre',
        id: 'assessment-centre',
        to: '/evaluator-ai/assessment',
    },
    {
        icon: FileMagnifyingGlass,
        title: 'Evaluation Centre',
        id: 'evaluation-centre',
        to: '/evaluator-ai/evaluation',
    },
];
