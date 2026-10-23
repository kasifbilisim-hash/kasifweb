import { Body, Button, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";

// Tasarım dili siteyle aynı: duvar zemini, emaye yeşili başlık, tabela sarısı düğme. E-posta istemcileri
// için güvenli yazı tipi yığını kullanılır.
const c = { duvar: "#e6e4df", emaye: "#12372a", tabela: "#f2b705", murekkep: "#1a1a18", soluk: "#55554f" };
const font = "Arial, Helvetica, sans-serif";

export type MessageProps = {
  preview: string;
  heading: string;
  paragraphs: string[];
  cta?: { label: string; url: string };
};

export function Message({ preview, heading, paragraphs, cta }: MessageProps) {
  return (
    <Html lang="tr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: c.duvar, margin: 0, padding: "24px 12px", fontFamily: font, color: c.murekkep }}>
        <Container style={{ maxWidth: 560, backgroundColor: "#ffffff", border: `3px solid ${c.murekkep}` }}>
          <Section style={{ backgroundColor: c.emaye, padding: "14px 24px" }}>
            <Text style={{ margin: 0, color: "#ffffff", fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>KAŞİF</Text>
          </Section>
          <Section style={{ padding: "24px" }}>
            <Text style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 700, color: c.emaye, lineHeight: "28px" }}>{heading}</Text>
            {paragraphs.map((p, i) => (
              <Text key={i} style={{ margin: "0 0 12px", fontSize: 16, lineHeight: "24px" }}>{p}</Text>
            ))}
            {cta ? (
              <Button href={cta.url} style={{ backgroundColor: c.tabela, color: c.murekkep, fontWeight: 700, fontSize: 16, padding: "12px 24px", marginTop: 8, textDecoration: "none" }}>
                {cta.label}
              </Button>
            ) : null}
          </Section>
          <Hr style={{ borderColor: c.murekkep, margin: 0 }} />
          <Section style={{ padding: "16px 24px" }}>
            <Text style={{ margin: 0, fontSize: 13, color: c.soluk, lineHeight: "20px" }}>
              Kaşif Yazılım. Bu e-posta hesabınızdaki bir işlem nedeniyle gönderildi.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
