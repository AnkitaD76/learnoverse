import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { fetchCourseById, createLessonLiveSession } from '../../api/courses';
import { useSession } from '../../contexts/SessionContext';

const LiveSessionPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useSession();

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const jitsiRef = useRef(null);
  const containerRef = useRef(null);
  const [polling, setPolling] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchCourseById(courseId);
      setCourse(res.course);
      const l = (res.course.lessons || []).find(l => String(l._id) === String(lessonId));
      setLesson(l || null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [courseId, lessonId]);
  useEffect(() => {
    // When room becomes available, try to embed via External API
    const room = lesson?.live?.roomName;
    // If no room and we're not the owner, start polling for room creation
    // compute owner locally to avoid TDZ issues
    const ownerCheck = user && (user.role === 'admin' || String(user._id) === String(course?.instructor?._id));
    if (!room && !ownerCheck) {
      if (!polling) setPolling(true);
      return;
    }
    // stop polling when room is present
    if (room && polling) setPolling(false);
    if (!room) return;

    // Cleanup any previous instance
    if (jitsiRef.current && typeof jitsiRef.current.dispose === 'function') {
      try { jitsiRef.current.dispose(); } catch (e) { /* ignore */ }
      jitsiRef.current = null;
    }

    const initJitsi = async () => {
      // Load external_api.js if not present
      if (!window.JitsiMeetExternalAPI) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://meet.jit.si/external_api.js';
          s.async = true;
          s.onload = resolve;
          s.onerror = reject;
          document.body.appendChild(s);
        }).catch(err => {
          console.error('Failed to load Jitsi external API', err);
        });
      }

      if (!window.JitsiMeetExternalAPI) {
        console.error('Jitsi API not available');
        return;
      }

      console.log('LiveSession: embedding room=', room, 'container=', containerRef.current);

      // wait briefly for container to be attached if needed
      let attempts = 0;
      while (!containerRef.current && attempts < 10) {
        // wait 100ms
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, 100));
        attempts += 1;
      }

      if (!containerRef.current) {
        console.error('LiveSession: container missing, cannot embed Jitsi');
        return;
      }

      // sanitize room name
      const safeRoom = String(room).replace(/\s+/g, '-');

      // Create the Jitsi widget inside containerRef
      const domain = 'meet.jit.si';
      const options = {
        roomName: room,
        parentNode: containerRef.current,
        width: '100%',
        height: '100%',
        configOverwrite: { 
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
        },
        userInfo: {
          displayName: user?.name || undefined,
        },
      };

      try {
        jitsiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        console.log('LiveSession: Jitsi initialized', jitsiRef.current);
      } catch (e) {
        console.error('Failed to init Jitsi', e);
      }
    };

    initJitsi();

    return () => {
      if (jitsiRef.current && typeof jitsiRef.current.dispose === 'function') {
        try { jitsiRef.current.dispose(); } catch (e) { /* ignore */ }
        jitsiRef.current = null;
      }
    };
  }, [lesson?.live?.roomName, user]);

  // Poll for room creation when waiting as a student
  useEffect(() => {
    if (!polling) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetchCourseById(courseId);
        const updatedLesson = (res.course.lessons || []).find(l => String(l._id) === String(lessonId));
        if (updatedLesson && updatedLesson.live?.roomName) {
          if (!cancelled) {
            setLesson(updatedLesson);
            setCourse(res.course);
            setPolling(false);
            // navigate to same page to trigger embedding (or embed directly)
            // embedding will be triggered by lesson change
          }
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [polling, courseId, lessonId]);

  const handleCreate = async () => {
    if (!lesson) return;
    try {
      setCreating(true);
      await createLessonLiveSession(courseId, lesson._id, { startTime: lesson.live?.startTime });
      await load();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create live session');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <p className="text-sm text-[#4A4A4A] p-4">Loading session...</p>;
  if (!course || !lesson) return <p className="text-sm text-red-600 p-4">Session not found.</p>;

  const room = lesson.live?.roomName;
  const joinCode = lesson.live?.joinCode;

  const isOwner = user && (user.role === 'admin' || String(user._id) === String(course.instructor?._id));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">{course.title}</h1>
            <p className="text-sm text-[#4A4A4A]">Lesson: {lesson.order + 1}. {lesson.title}</p>
            {joinCode && <p className="text-xs text-[#4A4A4A]">Join code: <strong>{joinCode}</strong></p>}
            {lesson.live?.startTime && (
              <p className="text-xs text-[#4A4A4A]">Start: {new Date(lesson.live.startTime).toLocaleString()}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
            {isOwner && !room && (
              <Button onClick={handleCreate} isLoading={creating} className="bg-red-500 text-white">Create Session</Button>
            )}
            {room && (
              <Button onClick={() => window.open(`https://meet.jit.si/${room}`, '_blank')} className="bg-[#FF6A00] text-white">Open in New Tab</Button>
            )}
          </div>
        </div>

        <Card className="p-0">
          {room ? (
            <div style={{height: '75vh'}} ref={containerRef}>
              {/* Jitsi External API will render into this container */}
            </div>
          ) : (
            <div className="p-6">
              <p className="text-sm text-[#4A4A4A]">Live session has not been created for this lesson yet.</p>
              {isOwner ? (
                <div className="mt-4">
                  <p className="text-sm text-[#4A4A4A]">Click "Create Session" to provision a Jitsi room.</p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#4A4A4A]">Please wait for the instructor to create the session.</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LiveSessionPage;
