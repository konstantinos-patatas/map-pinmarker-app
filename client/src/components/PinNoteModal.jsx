import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box
} from '@mui/material';

export default function PinNoteModal({ open, onClose, onConfirm, coordinates }) {
    const [note, setNote] = useState('');

    const handleConfirm = () => {
        onConfirm(note);
        setNote(''); // reset for next time
        onClose();
    };

    const handleCancel = () => {
        setNote(''); // reset
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
            <DialogTitle>Add Pin</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Location: {coordinates?.lat?.toFixed(5)}, {coordinates?.lng?.toFixed(5)}
                    </Typography>
                </Box>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Note (optional)"
                    placeholder="e.g., Free after 6pm and weekends"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    sx={{ mt: 1 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Add any useful information about this location
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained">
                    Add Pin
                </Button>
            </DialogActions>
        </Dialog>
    );
}