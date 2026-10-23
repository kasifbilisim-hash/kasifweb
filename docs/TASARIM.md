# Tasarım yönü: "Tabela" (Yön A)

Esnaf tabelası ve dükkân camı dili. Hedef kitle (KOBİ, esnaf) zaten bu dünyanın içinde.

## Fontlar
- Başlık: Archivo (Expanded / Black ağırlık, geniş ve ağır, tabela harfi)
- Metin: Newsreader (serif, Türkçe karakter desteği tam; serif olduğu için line-height 1.6+)
- Her ikisi `next/font/google` ile, `subset: ["latin", "latin-ext"]` (ğ, ş, İ, ı için latin-ext şart)

## Renk token'ları (globals.css'e CSS değişkeni olarak)
| Token | Hex | Kullanım |
|---|---|---|
| `--duvar` | `#E6E4DF` | Sayfa zemini |
| `--emaye` | `#12372A` | Koyu yeşil bantlar, ana koyu yüzey |
| `--tabela` | `#F2B705` | Tek vurgu rengi (fiyat levhası, birincil buton) |
| `--murekkep` | `#1A1A18` | Metin |
| `--beyaz` | `#FFFFFF` | Emaye üzerindeki metin, kâğıt yüzeyler |

Kontrast: murekkep/duvar ve beyaz/emaye AA üstü. Sarı üzerinde yalnızca murekkep metin kullan; sarı üzerine beyaz yok.

## Düzen ilkeleri
- Sol hizalı, dev başlıklar kenara taşabilir. Ortalanmış "başlık + alt başlık + 3 kart" kalıbı yok.
- Her bölüm farklı ritimde: tam genişlik emaye "tabela" bandı, dar iki sütun, fiyat levhası.
- Fiyat hero'nun parçası: ilk ekranda fiyat, 12 ay taahhüt ve "reklam bütçesi sizin kartınızdan Google'a gider" yazar.
- İkon, emoji, gradyan, blob, glassmorphism yok. Gölge yok ya da tek tip sert gölge (levha hissi).
- Hareket: yalnızca ilk ekranda tek bir giriş anı. Kaydırınca fade-in yok. `prefers-reduced-motion` saygı görür.
- Odak halkası görünür (sarı/emaye, 3px).

## İlk ekran (kaba tarif)
Soldan taşan dev başlık: "Siteniz ve Google reklamınız. Ayda 3.000 TL." Altında tek cümle reklam bütçesi ayrımı. Sağda sarı zemin üzerine "levha": 12 ay taahhüt, memnun kalmazsan iptal talebi, alan adı sende kalır. Birincil buton: "Paketleri gör".

## Risk ve önlem
Fazla "esnaf" görünüp kurumsal güveni zayıflatma riski var. Önlem: tipografiyi disiplinli tut, renk sayısını sınırla, metinleri somut ve sakin yaz.
