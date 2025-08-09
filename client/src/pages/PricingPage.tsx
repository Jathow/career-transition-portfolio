import React from 'react';
import { Box, Card, CardContent, Container, Grid, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const PricingPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h1">Pricing</Typography>
        <Typography variant="body2" color="text.secondary">Compare plans. Payments disabled in this demo.</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Free</Typography>
              <Typography variant="h6" sx={{ mb: 1 }}>$0</Typography>
              <List dense>
                <ListItem><CheckIcon fontSize="small" /><ListItemText primary="Core features" /></ListItem>
                <ListItem><CheckIcon fontSize="small" /><ListItemText primary="Daily quotas" /></ListItem>
              </List>
              <Button variant="outlined" disabled fullWidth>Current plan</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Pro</Typography>
              <Typography variant="h6" sx={{ mb: 1 }}>$9/mo</Typography>
              <List dense>
                <ListItem><CheckIcon fontSize="small" /><ListItemText primary="Higher quotas" /></ListItem>
                <ListItem><CheckIcon fontSize="small" /><ListItemText primary="Priority features" /></ListItem>
              </List>
              <Button variant="contained" disabled fullWidth>Upgrade (demo)</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PricingPage;


