'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { subjects } from '@/lib/subjects-data';

export default function SubjectCards() {
  const router = useRouter();
  
  const handleSubjectClick = (subjectId: string) => {
    router.push(`/subjects/${subjectId}`);
  };
  
  const handleStartTutoring = (subjectId: string) => {
    router.push(`/tutoring/${subjectId}`);
  };

  return (
    <section className="section-spacing">
      <h2 className="text-2xl font-medium mb-8 tracking-tight">Explore Subjects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((subject) => (
          <div key={subject.id} className="subject-card" style={{ borderLeft: `4px solid ${subject.color}` }}>
            <h3 className="text-xl font-medium mb-2">{subject.name}</h3>
            <p className="text-gray-600 mb-4">{subject.description}</p>
            
            <div className="text-sm text-gray-500 mb-3">
              {subject.topics.length} topics • {subject.topics.reduce((count, topic) => count + topic.subtopics.length, 0)} lessons
            </div>
            
            <div className="mb-6">
              <div className="font-medium text-sm mb-2">Topics include:</div>
              <ul className="pl-5 list-disc space-y-1 text-gray-600 text-sm">
                {subject.topics.slice(0, 3).map(topic => (
                  <li key={topic.id}>{topic.title}</li>
                ))}
                {subject.topics.length > 3 && <li>And more...</li>}
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <Button 
                className="flex-1" 
                onClick={() => handleSubjectClick(subject.id)}
              >
                View Learning Path
              </Button>
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={() => handleStartTutoring(subject.id)}
              >
                Start Tutoring
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 