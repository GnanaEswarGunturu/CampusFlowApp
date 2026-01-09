import { createMachine, assign } from 'xstate';
import { MockDataService } from '../services/MockDataService';

export const attendanceMachine = createMachine({
  id: 'attendance',
  initial: 'IDLE',
  context: {
    currentSession: null,
    scannedIDs: [],
    attendanceList: [],
    error: null,
    offlineQueue: []
  },
  states: {
    IDLE: {
      on: {
        START_ATTENDANCE: 'SESSION_RESOLVED'
      }
    },
    SESSION_RESOLVED: {
      entry: assign({
        currentSession: () => {
          console.log("[AttendanceMachine] Resolving session...");
          const detected = MockDataService.detectCurrentSession('F001');
          console.log("[AttendanceMachine] Detected:", detected?.classInfo?.subject);
          return detected ? {
            id: detected._id,
            course: detected.classInfo.subject,
            instructor: 'Dr. Rao',
            time: detected.displayTime,
            venue: detected.classInfo.department + " - " + detected.classInfo.section,
            raw: detected
          } : null;
        }
      }),
      on: {
        CONFIRM: 'READY_TO_CAPTURE',
        RETRY: 'IDLE'
      }
    },
    READY_TO_CAPTURE: {
      on: {
        START_HARDWARE_SCAN: 'CAPTURING',
        CANCEL: 'IDLE'
      }
    },
    CAPTURING: {
      on: {
        HARDWARE_SCAN_COMPLETE: 'PROCESSING',
        FAILURE: {
          target: 'FAILED',
          actions: assign({ error: ({ event }) => event.error })
        },
        CANCEL: 'READY_TO_CAPTURE'
      }
    },
    PROCESSING: {
      on: {
        FACE_RECOGNITION_COMPLETE: {
          target: 'REVIEW_PENDING',
          actions: assign({ attendanceList: ({ event }) => event.results })
        },
        FAILURE: {
          target: 'FAILED',
          actions: assign({ error: ({ event }) => event.error })
        },
        CANCEL: 'READY_TO_CAPTURE'
      }
    },
    REVIEW_PENDING: {
      on: {
        SUBMIT: 'SUBMITTING',
        RETAKE: 'READY_TO_CAPTURE',
        CANCEL: 'IDLE'
      }
    },
    SUBMITTING: {
      on: {
        SUCCESS: 'COMPLETED',
        OFFLINE: 'QUEUED',
        FAILURE: {
          target: 'FAILED',
          actions: assign({ error: ({ event }) => event.error })
        }
      }
    },
    QUEUED: {
      on: {
        RETRY_SYNC: 'SUBMITTING',
        RESET: 'IDLE'
      }
    },
    COMPLETED: {
      on: {
        RESET: 'IDLE'
      }
    },
    FAILED: {
      on: {
        RETRY: 'IDLE'
      }
    }
  }
});
