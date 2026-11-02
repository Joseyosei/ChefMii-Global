import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are ChefMii Global Concierge, an ultra-premium AI culinary advisor for ChefMii Global — the world-class private chef and gastronomy platform.

ABOUT CHEFMII GLOBAL:
ChefMii Global connects discerning clients with verified, Michelin-trained, and master private chefs worldwide for intimate dinners, romantic dates, weddings, family celebrations, and corporate events.

OUR VERIFIED INTERNATIONAL CHEFS ROSTER:
1. Chef Marco Rossi — Italian Fine Dining & Handmade Pasta | London, UK | £150/hr | /book/marco-rossi
2. Chef Yuki Tanaka — Japanese Omakase & Edomae Master | Dubai, UAE | £200/hr | /book/yuki-tanaka
3. Chef Pierre Dubois — French Haute Cuisine & Pastry | Paris, France | £180/hr | /book/pierre-dubois
4. Chef Marcus Vance — American Contemporary & Farm-to-Table | New York, USA | £160/hr | /book/marcus-vance
5. Chef Éléna Beauchamp — French-Canadian & Nordic-Pacific | Montreal, Canada | £140/hr | /book/elena-beauchamp
6. Chef Wei Zhang — Chinese Cantonese Imperial & Dim Sum | Shanghai, China | £175/hr | /book/wei-zhang
7. Chef Olena Kovalenko — Modern Ukrainian & Heritage Slavic | Kyiv, Ukraine | £110/hr | /book/olena-kovalenko
8. Chef Henrik Lindqvist — New Nordic & Arctic Seafood | Oslo, Norway | £190/hr | /book/henrik-lindqvist
9. Chef Kenji Sato — Traditional Kyoto Kaiseki & Wagyu A5 | Kyoto, Japan | £220/hr | /book/kenji-sato
10. Chef Min-Jun Park — Modern Korean & Royal Court Hansik | Seoul, South Korea | £165/hr | /book/min-jun-park
11. Chef Tariq Al-Ghamdi — Contemporary Khaleeji & Royal Banquet | Riyadh, Saudi Arabia | £195/hr | /book/tariq-al-ghamdi
12. Chef Aisha Okafor — West African & Gourmet Jollof | Lagos, Nigeria | £80/hr | /book/aisha-okafor
13. Chef Sofía Mendez — Spanish Tapas & Paella Modernist | Barcelona, Spain | £120/hr | /book/sofia-mendez
14. Chef James Osei — Pan-African Fusion & Events Banquet | Accra, Ghana | £70/hr | /book/james-osei
15. Chef Meera Patel — Indian Ayurvedic & Spice Journey | Birmingham, UK | £95/hr | /book/meera-patel
16. Chef Carlos Garcia — Modern Mexican & Street Food Gastronomy | Mexico City | £85/hr | /book/carlos-garcia

KEY PLATFORM FEATURES:
- **100% Escrow Protection**: Client payment is held safely via Stripe Connect until after the event is successfully completed.
- **20% Advance Deposit**: For events booked >5 weeks in advance, clients can secure the date with only 20% down.
- **Split Bill Feature**: Group hosts can split dining costs evenly with attendees.
- **Full Service Included**: Every chef booking includes ingredient sourcing, bespoke menu curation, table service, and complete spotless kitchen cleanup.
- **VIP Early Access Waitlist**: Located at /waitlist — clients and chefs can register to secure early booking priority and zero service fees on their first booking.
- **Marketplace & Academy**: Artisanal ingredients (/marketplace) and masterclasses with live streaming (/chef-media, /academy).

BEHAVIOR GUIDELINES:
- Always be warm, sophisticated, professional, and culinary-literate.
- Tailor recommendations to location or preferred cuisine and suggest direct booking links like \`/book/marco-rossi\`.
- Suggest visiting \`/waitlist\` for VIP access or \`/find-chefs\` to explore the full roster.
- Keep responses concise (around 2-4 sentences or clean bullet points).`

function generateSmartFallback(query: string): string {
    const q = query.toLowerCase()

    if (q.includes('italian') || q.includes('pasta') || q.includes('rome') || q.includes('milan')) {
        return "For Italian fine dining, I highly recommend **Chef Marco Rossi** (£150/hr, London/UK) specializing in artisanal handmade pasta, truffles, and Tuscan multicourse banquets. You can reserve his services directly at [/book/marco-rossi](/book/marco-rossi) or secure priority booking on our [VIP Waitlist](/waitlist)."
    }
    if (q.includes('japanese') || q.includes('sushi') || q.includes('omakase') || q.includes('kaiseki') || q.includes('tokyo') || q.includes('kyoto')) {
        return "For Japanese gastronomy, we feature **Chef Yuki Tanaka** (£200/hr, Edomae Omakase Master at [/book/yuki-tanaka](/book/yuki-tanaka)) and **Chef Kenji Sato** (£220/hr, Traditional Kyoto Kaiseki & Wagyu A5 at [/book/kenji-sato](/book/kenji-sato)). Both offer exquisite bespoke tasting menus with complete table service."
    }
    if (q.includes('french') || q.includes('paris') || q.includes('bordeaux')) {
        return "For classic French Haute Cuisine, **Chef Pierre Dubois** (£180/hr, former Hôtel de Crillon executive chef) creates Parisian wine pairing dinners and fine pastry at [/book/pierre-dubois](/book/pierre-dubois). You can also explore **Chef Éléna Beauchamp** for French-Canadian fusion at [/book/elena-beauchamp](/book/elena-beauchamp)."
    }
    if (q.includes('escrow') || q.includes('payment') || q.includes('deposit') || q.includes('protect') || q.includes('price') || q.includes('pricing') || q.includes('cost')) {
        return "ChefMii Global operates with **100% Escrow Protection** via Stripe Connect. Your funds are held securely until the chef completes your event. For bookings >5 weeks out, you can reserve with just a **20% advance deposit**, with full kitchen cleanup included in all chef rates (£70 - £220/hr)."
    }
    if (q.includes('waitlist') || q.includes('vip') || q.includes('early') || q.includes('register') || q.includes('launch')) {
        return "You can join our **VIP Early Access Waitlist** at [/waitlist](/waitlist). Members receive priority access to top-rated Michelin chefs, 0% platform service fees on their inaugural booking, and bespoke event consultation."
    }
    if (q.includes('chinese') || q.includes('dim sum') || q.includes('sichuan') || q.includes('cantonese') || q.includes('asian')) {
        return "For Chinese haute cuisine, **Chef Wei Zhang** (£175/hr, Shanghai) specializes in imperial Cantonese banquets, precision wok artistry, and handmade dim sum. View his tasting menus at [/book/wei-zhang](/book/wei-zhang)."
    }
    if (q.includes('korean') || q.includes('hansik') || q.includes('seoul')) {
        return "For Korean gastronomy, **Chef Min-Jun Park** (£165/hr, Seoul) brings modern royal court Hansik and 10-year aged jang fermentation pairings to private events. Explore his profile at [/book/min-jun-park](/book/min-jun-park)."
    }
    if (q.includes('saudi') || q.includes('arabian') || q.includes('middle east') || q.includes('halal') || q.includes('riyadh')) {
        return "For royal Khaleeji hospitality, **Chef Tariq Al-Ghamdi** (£195/hr, Riyadh) crafts slow-cooked Najdi lamb feasts and saffron-cardamom banquet experiences. Discover his offerings at [/book/tariq-al-ghamdi](/book/tariq-al-ghamdi)."
    }
    if (q.includes('african') || q.includes('jollof') || q.includes('nigeria') || q.includes('ghana')) {
        return "We have outstanding Pan-African talent: **Chef Aisha Okafor** (£80/hr, Lagos) for gourmet West African dining at [/book/aisha-okafor](/book/aisha-okafor) and **Chef James Osei** (£70/hr, Accra) for large banquets at [/book/james-osei](/book/james-osei)."
    }
    if (q.includes('american') || q.includes('bbq') || q.includes('new york') || q.includes('usa')) {
        return "For contemporary American farm-to-table cuisine, **Chef Marcus Vance** (£160/hr, New York) offers wood-fired tasting menus and Hudson Valley seasonal pairings at [/book/marcus-vance](/book/marcus-vance)."
    }
    if (q.includes('norway') || q.includes('nordic') || q.includes('scandinavian') || q.includes('oslo')) {
        return "For Scandinavian fine dining, **Chef Henrik Lindqvist** (£190/hr, Oslo) specializes in New Nordic foraging and cold-smoked fjord seafood at [/book/henrik-lindqvist](/book/henrik-lindqvist)."
    }
    if (q.includes('ukraine') || q.includes('kyiv')) {
        return "For modern Eastern European heritage cuisine, **Chef Olena Kovalenko** (£110/hr, Kyiv) presents artisanal tasting menus with delicate fermentation and seasonal game at [/book/olena-kovalenko](/book/olena-kovalenko)."
    }

    return "Welcome to **ChefMii Global Concierge**! We connect you with 16+ verified private chefs worldwide across Italian, Japanese, French, Nordic, Korean, African, and Middle Eastern cuisines. Browse our chefs at [/find-chefs](/find-chefs) or join the [VIP Waitlist](/waitlist) for priority booking."
}

export async function POST(request: NextRequest) {
    try {
        const { message, history } = await request.json()

        if (!message) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        let reply = ''

        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey)
            const modelsToTry = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3-flash-preview', 'gemini-flash-latest']

            const conversationContext = Array.isArray(history) && history.length > 0
                ? history.slice(-6).map((h: { role: string; content: string }) => `${h.role === 'user' ? 'Client' : 'ChefMii Assistant'}: ${h.content}`).join('\n') + `\nClient: ${message}`
                : message

            for (const modelName of modelsToTry) {
                try {
                    const model = genAI.getGenerativeModel({ model: modelName })
                    const result = await model.generateContent([SYSTEM_PROMPT, conversationContext])
                    const txt = result.response.text()
                    if (txt && txt.trim().length > 0) {
                        reply = txt
                        break
                    }
                } catch (err) {
                    console.warn(`Model ${modelName} call:`, err)
                }
            }
        }

        if (!reply) {
            reply = generateSmartFallback(message)
        }

        return NextResponse.json({ reply })
    } catch (error) {
        console.error('Chat endpoint error:', error)
        return NextResponse.json({
            reply: generateSmartFallback('help')
        })
    }
}
