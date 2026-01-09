// SchemaValidator.js - Local V1 Enforcement
export const SchemaValidator = {
    validateAttendance: (record) => {
        const required = ['student_id', 'session_id', 'status', 'marked_by', 'timestamp'];
        const missing = required.filter(field => !record[field]);

        if (missing.length > 0) {
            throw new Error(`Schema Violation: Missing fields [${missing.join(', ')}]`);
        }

        if (!['PRESENT', 'ABSENT'].includes(record.status)) {
            throw new Error(`Schema Violation: Invalid status ${record.status}`);
        }

        if (!['ML', 'FACULTY'].includes(record.marked_by)) {
            throw new Error(`Schema Violation: Invalid marked_by ${record.marked_by}`);
        }

        return true;
    },

    validateAuditLog: (log) => {
        const required = ['action', 'performed_by', 'timestamp', 'details'];
        return required.every(field => !!log[field]);
    }
};
