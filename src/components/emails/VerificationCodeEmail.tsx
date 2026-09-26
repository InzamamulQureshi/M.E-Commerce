import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface VerificationCodeEmailProps {
  code: string;
  userName?: string;
  storeName?: string;
}

export const VerificationCodeEmail: React.FC<VerificationCodeEmailProps> = ({
  code = "123456",
  userName = "Artisan Patron",
  storeName = "M.E-Commerce",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your {storeName} verification code is {code}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={brandBadgeStyle}>{storeName.toUpperCase()}</Text>
            <Heading style={headingStyle}>Verification Code</Heading>
          </Section>

          {/* Content */}
          <Section style={contentSectionStyle}>
            <Text style={greetingTextStyle}>
              Hello {userName ? userName : "there"},
            </Text>
            <Text style={bodyTextStyle}>
              Use the single-use verification code below to securely authenticate your account on{" "}
              <strong>{storeName}</strong>:
            </Text>

            {/* OTP Code Card */}
            <Section style={codeCardStyle}>
              <Text style={otpCodeStyle}>{code}</Text>
            </Section>

            <Text style={expireNoticeStyle}>
              ⏱️ This code expires in 10 minutes. If you did not request this verification, please safely ignore this email.
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              © {new Date().getFullYear()} {storeName} Studio. Crafted with care.
            </Text>
            <Text style={footerSubtextStyle}>
              This is an automated security transmission. Please do not reply directly to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationCodeEmail;

// Inline styles for high email client compatibility (Outlook, Gmail, Apple Mail)
const mainStyle: React.CSSProperties = {
  backgroundColor: "#f5f2eb",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: "36px 0",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e7dfd3",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "36px 32px",
  boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
};

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "24px",
};

const brandBadgeStyle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.22em",
  color: "#944434",
  fontWeight: 700,
  margin: "0 0 8px 0",
};

const headingStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  color: "#181513",
  margin: "0",
  letterSpacing: "-0.02em",
};

const contentSectionStyle: React.CSSProperties = {
  margin: "16px 0 24px 0",
};

const greetingTextStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#3d3630",
  margin: "0 0 12px 0",
  lineHeight: "1.5",
};

const bodyTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#524a42",
  lineHeight: "1.6",
  margin: "0 0 20px 0",
};

const codeCardStyle: React.CSSProperties = {
  backgroundColor: "#faf7f2",
  border: "1px solid #ded5c6",
  borderRadius: "12px",
  padding: "18px 24px",
  textAlign: "center",
  margin: "20px 0",
};

const otpCodeStyle: React.CSSProperties = {
  fontSize: "36px",
  fontWeight: 800,
  letterSpacing: "0.28em",
  color: "#181513",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  margin: "0",
};

const expireNoticeStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#857b6f",
  lineHeight: "1.5",
  margin: "12px 0 0 0",
  textAlign: "center",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#eae3d6",
  margin: "28px 0 20px 0",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
};

const footerTextStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#857b6f",
  margin: "0 0 4px 0",
};

const footerSubtextStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#a4998c",
  margin: "0",
};
