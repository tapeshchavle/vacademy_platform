import { createLazyFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { StudentsListSection } from '@/routes/manage-students/students-list/-components/students-list/student-list-section/students-list-section';
import { Helmet } from 'react-helmet';
import { getTerminologyPlural } from '@/components/common/layout-container/sidebar/utils';
import { RoleTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

export const Route = createLazyFileRoute('/manage-students/students-list/')({
    component: StudentsList,
});

export function StudentsList() {
    const learnersLabel = getTerminologyPlural(RoleTerms.Learner, SystemTerms.Learner);
    return (
        <LayoutContainer>
            {/* <EmptyDashboard /> */}
            <Helmet>
                <title>{learnersLabel}</title>
                <meta
                    name="description"
                    content={`This page shows all the ${learnersLabel.toLowerCase()} of the institute.`}
                />
            </Helmet>
            <StudentsListSection />
        </LayoutContainer>
    );
}
