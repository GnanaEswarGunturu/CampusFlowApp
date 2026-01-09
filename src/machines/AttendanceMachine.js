import { createMachine, assign } from 'xstate';

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
        currentSession: () => ({
          course: 'CS401: Artificial Intelligence',
          instructor: 'Dr. Sarah Smith',
          time: new Date().toLocaleTimeString(),
          venue: 'Lecture Hall A'
        })
      }),
      on: {
        CONFIRM: 'READY_TO_CAPTURE',
        RETRY: 'IDLE'
      }
    },
    READY_TO_CAPTURE: {
      on: {
        START_HARDWARE_SCAN: 'CAPTURING'
      }
    },
    CAPTURING: {
      on: {
        HARDWARE_SCAN_COMPLETE: 'PROCESSING',
        FAILURE: 'FAILED'
      }
    },
    PROCESSING: {
      on: {
        FACE_RECOGNITION_COMPLETE: 'REVIEW_PENDING',
        FAILURE: 'FAILED'
      }
    },
    REVIEW_PENDING: {
      on: {
        SUBMIT: 'SUBMITTING',
        RETAKE: 'READY_TO_CAPTURE'
      }
    },
    SUBMITTING: {
      on: {
        SUCCESS: 'COMPLETED',
        OFFLINE: 'QUEUED',
        FAILURE: 'FAILED'
      }
    },
    QUEUED: {
      on: {
        RETRY_SYNC: 'SUBMITTING'
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
