import React from 'react'
import { Box, Typography, Divider, Container } from '@mui/material'
import { Copyright } from '@mui/icons-material'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto',
        py: 4,
        backgroundColor: 'grey.50',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 0.5,
              mb: 1 
            }}
          >
            <Copyright sx={{ fontSize: '1rem' }} />
            {currentYear} Romain Bossut. All rights reserved.
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: '0.8rem' }}
          >
            Contact: <a 
              href="mailto:contact@mortgasim.com" 
              style={{ 
                color: 'inherit', 
                textDecoration: 'none' 
              }}
              onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              contact@mortgasim.com
            </a>
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
            Terms of Use & Legal Disclaimer
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            <strong>Important Notice:</strong> This mortgage simulation tool is provided for informational and educational purposes only. 
            The calculations, projections, and results are estimates based on the parameters you provide and should not be considered 
            as financial advice, recommendations, or guarantees of future performance.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            <strong>Accuracy Disclaimer:</strong> While we strive to ensure the accuracy of our calculations, we make no representations 
            or warranties, express or implied, about the completeness, accuracy, reliability, or suitability of the information, 
            calculations, or projections provided. Interest rates, market conditions, and financial circumstances can vary significantly 
            and may affect actual outcomes.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            <strong>Professional Advice:</strong> Before making any financial decisions, you should consult with qualified financial 
            advisors, mortgage brokers, or other professionals who can provide advice tailored to your specific circumstances. 
            This tool does not replace professional financial guidance.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            <strong>Limitation of Liability:</strong> To the fullest extent permitted by applicable law, including but not limited to 
            Scottish law, UK law, and EU regulations, we disclaim all liability for any direct, indirect, incidental, consequential, 
            or special damages arising from your use of this tool or reliance on its results. This includes, without limitation, 
            any financial losses, missed opportunities, or adverse outcomes.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            <strong>Intellectual Property:</strong> This website, including all content, software, graphics, design, and functionality, 
            is protected by copyright and other intellectual property laws. Unauthorized reproduction, distribution, or modification 
            is strictly prohibited.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            <strong>Data Protection:</strong> Your use of this tool is subject to applicable data protection laws, including the 
            UK Data Protection Act 2018 and the EU General Data Protection Regulation (GDPR). We do not store personal financial 
            information entered into this tool.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            <strong>Governing Law:</strong> These terms and your use of this website are governed by the laws of Scotland and the 
            United Kingdom, without regard to conflict of law provisions. Any disputes shall be subject to the exclusive jurisdiction 
            of the Scottish courts. For EU residents, nothing in these terms affects your statutory rights under applicable EU consumer protection laws.
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date().toLocaleDateString('en-GB')} | 
            By using this tool, you acknowledge that you have read, understood, and agree to these terms.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
} 