import { PrismaClient, Role, OrderStatus, PaymentMethod } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting The Fourfold database seed...");

  // 1. Clean existing records in correct relation order
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Admin and Demo Customer
  const adminPasswordHash = await bcrypt.hash("thefourfold_admin_2026", 10);
  const customerPasswordHash = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "The Fourfold Studio Team",
      email: "artisan@thefourfold.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      phone: "+91 98765 43210",
      address: "Studio 4B, Artisans Lane, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400050",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Ananya Sharma",
      email: "ananya.sharma@example.com",
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      phone: "+91 98111 22334",
      address: "Flat 204, Sea Breeze Apartments, Bandra",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400050",
    },
  });

  console.log("✅ Admin and customer users seeded.");

  // 3. Create Categories & Subcategories
  const catExplosion = await prisma.category.create({
    data: {
      name: "Explosion & Surprise Boxes",
      slug: "explosion-boxes",
      description: "Intricate multi-layered folded surprise boxes that blossom open to reveal heartfelt memories, photo slots, and hidden compartments.",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
      orderIndex: 1,
      subcategories: {
        create: [
          {
            name: "Multi-Layer Photo Boxes",
            slug: "multi-layer-photo-boxes",
            description: "3 to 4 tiers of unfolding photo flaps, waterfall tags, and secret pull-out notes.",
            orderIndex: 1,
          },
          {
            name: "Hexagon & Castle Surprise Boxes",
            slug: "hexagon-castle-boxes",
            description: "Six-sided architectural explosion designs with center gift pedestals.",
            orderIndex: 2,
          },
          {
            name: "Mini Pocket Explosion Cards",
            slug: "mini-pocket-cards",
            description: "Compact desk-friendly pop-open cards with miniature envelopes and keepsakes.",
            orderIndex: 3,
          },
        ],
      },
    },
    include: { subcategories: true },
  });

  const catCards = await prisma.category.create({
    data: {
      name: "Handmade Cards & Letters",
      slug: "cards-letters",
      description: "Tactile greeting cards folded from artisanal cotton cardstock, finished with real melted wax seals and calligraphed notes.",
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
      orderIndex: 2,
      subcategories: {
        create: [
          {
            name: "Accordion Fold Keepsake Cards",
            slug: "accordion-fold-cards",
            description: "Continuous zig-zag folding cards that unfold like a mini storybook journey.",
            orderIndex: 1,
          },
          {
            name: "Vintage Wax-Sealed Letters",
            slug: "vintage-wax-letters",
            description: "Aged parchment stationery hand-stamped with personalized metallic wax crests.",
            orderIndex: 2,
          },
          {
            name: "Botanical 3D Pop-Up Cards",
            slug: "botanical-popup-cards",
            description: "Hand-cut papercraft floral blooms that spring to life when opened.",
            orderIndex: 3,
          },
        ],
      },
    },
    include: { subcategories: true },
  });

  const catScrapbooks = await prisma.category.create({
    data: {
      name: "Scrapbooks & Keepsake Albums",
      slug: "scrapbooks-albums",
      description: "Heirloom-grade hand-bound albums crafted with textured fabric, deckled Japanese paper, and magnetic ribbon ties.",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      orderIndex: 3,
      subcategories: {
        create: [
          {
            name: "Hand-Stitched Linen Fabric Albums",
            slug: "linen-albums",
            description: "Coptic-bound memory albums wrapped in natural raw linen and botanical embroidery.",
            orderIndex: 1,
          },
          {
            name: "Quadruple-Fold Memory Folios",
            slug: "memory-folios",
            description: "The signature Fourfold multi-directional expanding keepsake folios.",
            orderIndex: 2,
          },
          {
            name: "Mini Journal Keepsakes",
            slug: "mini-journals",
            description: "Pocket-sized journals for love letters, gratitude logs, and milestone dates.",
            orderIndex: 3,
          },
        ],
      },
    },
    include: { subcategories: true },
  });

  const catFlorals = await prisma.category.create({
    data: {
      name: "Preserved Floral & Crochet Crafts",
      slug: "floral-crafts",
      description: "Everlasting floral arrangements made of soft milk cotton yarn crochet and dried pressed botanical specimens.",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
      orderIndex: 4,
      subcategories: {
        create: [
          {
            name: "Handmade Crochet Tulip Bouquets",
            slug: "crochet-tulips",
            description: "Our signature everlasting pastel tulips crocheted with premium plush yarn.",
            orderIndex: 1,
          },
          {
            name: "Pressed Botanical Floating Frames",
            slug: "pressed-flower-frames",
            description: "Real pressed field wildflowers sealed between double-paned brass glass frames.",
            orderIndex: 2,
          },
          {
            name: "Resin Floral Coasters & Trinkets",
            slug: "resin-floral-coasters",
            description: "Crystal clear botanical resin trays and bookmarks with gold foil flakes.",
            orderIndex: 3,
          },
        ],
      },
    },
    include: { subcategories: true },
  });

  const catHampers = await prisma.category.create({
    data: {
      name: "Curated Bespoke Hampers",
      slug: "gift-hampers",
      description: "Luxe gift boxes bringing together hand-poured soy candles, wax-sealed stationery, crochet flowers, and custom keepsakes.",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
      orderIndex: 5,
      subcategories: {
        create: [
          {
            name: "Anniversary & Love Hampers",
            slug: "anniversary-hampers",
            description: "Romantic suites celebrating timeless love and shared journey milestones.",
            orderIndex: 1,
          },
          {
            name: "Birthday Celebration Treasure Boxes",
            slug: "birthday-treasure-boxes",
            description: "Joyful celebratory hampers filled with handcrafted surprises and sweet notes.",
            orderIndex: 2,
          },
          {
            name: "Bridesmaid & Sisterhood Suites",
            slug: "bridesmaid-suites",
            description: "Elegant bespoke gifting hampers curated for bridal squads and dear friends.",
            orderIndex: 3,
          },
        ],
      },
    },
    include: { subcategories: true },
  });

  console.log("✅ Categories & Subcategories seeded.");

  // Helper map for subcategories
  const subMap = (cat: any, slug: string) => cat.subcategories.find((s: any) => s.slug === slug)?.id;

  // 4. Seed Rich Handcrafted Products
  const products = [
    {
      title: "The Signature Blossom Explosion Box",
      slug: "signature-blossom-explosion-box",
      tagline: "4 Tiers of Unfolding Memories with Center Gift Keepsake",
      description: "Handcrafted with premium 320 GSM textured kraft and blush paper, this 4-tier explosion box blossoms open the moment the lid is lifted. It features 24 photo/message slots, 4 waterfall tag pull-outs, and an inner central velvet pedestal designed to cradle jewelry, a mini keepsake, or chocolates. Customized with your hand-written love letters and finished with a satin ribbon.",
      price: 1499.00,
      compareAtPrice: 1899.00,
      stock: 12,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80"
      ]),
      categoryId: catExplosion.id,
      subcategoryId: subMap(catExplosion, "multi-layer-photo-boxes"),
      materials: "320 GSM Textured Kraft Paper, Blush Mulberry Cardstock, Satin Ribbon, Gold Foil Accents",
      dimensions: "Closed: 12cm x 12cm x 12cm | Fully Open: 36cm x 36cm",
      craftDays: 3,
      isFeatured: true,
      isBestSeller: true,
      allowsCustomNote: true,
      allowsWaxSeal: true,
    },
    {
      title: "Royal Hexagon Castle Surprise Box",
      slug: "royal-hexagon-castle-surprise-box",
      tagline: "Geometric 6-sided multi-tier unfolding wonder",
      description: "An architectural marvel in papercraft! Featuring 6 symmetrical unfolding panels with hidden accordion pockets, pop-up origami hearts, and miniature scrolls. Crafted for anniversaries, birthdays, or milestone celebrations. Can be personalized with custom names calligraphed in gold ink on the top lid.",
      price: 1899.00,
      compareAtPrice: 2299.00,
      stock: 8,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80"
      ]),
      categoryId: catExplosion.id,
      subcategoryId: subMap(catExplosion, "hexagon-castle-boxes"),
      materials: "Imported Matte Cardstock, Wax Stamped Seals, Organza Bow",
      dimensions: "Diameter: 18cm | Height: 14cm",
      craftDays: 4,
      isFeatured: true,
      isBestSeller: false,
      allowsCustomNote: true,
      allowsWaxSeal: true,
    },
    {
      title: "Mini Pocket Love Explosion Card",
      slug: "mini-pocket-love-explosion-card",
      tagline: "Compact desk-friendly pop-open surprise",
      description: "A pocket-sized burst of affection. Folds flat into a sleek square envelope and pops open into a charming 3D multi-pocket display holding 4 polaroid-sized photos and 2 miniature handwritten scrolls. Perfect for long-distance surprises or everyday appreciation.",
      price: 599.00,
      compareAtPrice: 799.00,
      stock: 25,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80"
      ]),
      categoryId: catExplosion.id,
      subcategoryId: subMap(catExplosion, "mini-pocket-cards"),
      materials: "300 GSM Deckle-Edge Cardstock, Cotton Twine, Metallic Wax Seal",
      dimensions: "Closed: 9cm x 9cm | Open: 27cm x 27cm",
      craftDays: 2,
      isFeatured: false,
      isBestSeller: true,
      allowsCustomNote: true,
      allowsWaxSeal: true,
    },
    {
      title: "The Fourfold Accordion Storybook Card",
      slug: "fourfold-accordion-storybook-card",
      tagline: "Continuous 8-fold panoramic keepsake card",
      description: "Our signature piece! A panoramic accordion folded card that extends into a breathtaking 80cm visual timeline. Each fold is individually embellished with hand-cut paper lace, botanical pressings, and spaces for your cherished photographs and messages. Closes neatly into an archival linen portfolio envelope tied with hand-dyed silk ribbon.",
      price: 899.00,
      compareAtPrice: 1199.00,
      stock: 18,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80"
      ]),
      categoryId: catCards.id,
      subcategoryId: subMap(catCards, "accordion-fold-cards"),
      materials: "Heavyweight Cotton Rag Paper, Raw Silk Ribbon, Pressed Fern Leaves",
      dimensions: "Closed: 14cm x 10cm | Extended: 80cm x 10cm",
      craftDays: 2,
      isFeatured: true,
      isBestSeller: true,
      allowsCustomNote: true,
      allowsWaxSeal: true,
    },
    {
      title: "Vintage Parchment Wax-Sealed Letter Suite",
      slug: "vintage-parchment-wax-sealed-letter-suite",
      tagline: "Hand-aged deckle edge love letter in bespoke envelope",
      description: "Transport your words back to an era of romance. Each sheet of 100% recycled cotton rag paper is hand-torn for organic deckle edges, treated for an antique tea-stained patina, and enclosed within a bespoke handmade envelope sealed with hot beeswax and your chosen wax stamp crest. Your personalized message is carefully calligraphed or printed in vintage typography.",
      price: 499.00,
      compareAtPrice: 650.00,
      stock: 30,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80"
      ]),
      categoryId: catCards.id,
      subcategoryId: subMap(catCards, "vintage-wax-letters"),
      materials: "Handmade Cotton Rag Paper, Tea-Stained Patina, Genuine Beeswax Seal, Walnut Ink",
      dimensions: "Letter: A5 size (14.8cm x 21cm) | Envelope: C6 (16cm x 11.5cm)",
      craftDays: 1,
      isFeatured: false,
      isBestSeller: true,
      allowsCustomNote: true,
      allowsWaxSeal: true,
    },
    {
      title: "Botanical Meadow 3D Pop-Up Card",
      slug: "botanical-meadow-3d-popup-card",
      tagline: "A meadow of wildflower blossoms in folded paper",
      description: "Opening this card reveals a vibrant, hand-assembled 3D bouquet of daisies, wild lavender, and eucalyptus. Each petal is laser-cut and hand-shaped for lifelike depth and shadow. Includes a separate slide-out note card so your heartfelt words remain undisturbed by the floral display.",
      price: 649.00,
      compareAtPrice: 850.00,
      stock: 20,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80"
      ]),
      categoryId: catCards.id,
      subcategoryId: subMap(catCards, "botanical-popup-cards"),
      materials: "FSC Certified Heavy Art Paper, Shimmer Cardstock, Embossed Cover",
      dimensions: "Folded: 15cm x 15cm",
      craftDays: 2,
      isFeatured: false,
      isBestSeller: false,
      allowsCustomNote: true,
      allowsWaxSeal: true,
    },
    {
      title: "Hand-Bound Sage Linen Scrapbook Album",
      slug: "hand-bound-sage-linen-scrapbook-album",
      tagline: "30-page heirloom memory album with Coptic stitch binding",
      description: "An heirloom piece to preserve years of memories. Bound by hand using traditional exposed French Coptic stitch, allowing the album to lay completely flat when opened. Hardcover wrapped in organic sage green linen fabric with custom gold foil name embossing. Contains 30 sheets (60 pages) of 300 GSM archival black or cream cardstock, accompanied by 200 photo corner stickers.",
      price: 2199.00,
      compareAtPrice: 2699.00,
      stock: 10,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80"
      ]),
      categoryId: catScrapbooks.id,
      subcategoryId: subMap(catScrapbooks, "linen-albums"),
      materials: "Natural Woven Linen, 300 GSM Archival Acid-Free Paper, Waxed Thread, Gold Embossing",
      dimensions: "22cm x 22cm (Holds up to 120 photos)",
      craftDays: 4,
      isFeatured: true,
      isBestSeller: true,
      allowsCustomNote: true,
      allowsWaxSeal: true,
    },
    {
      title: "Everlasting Hand-Crocheted Tulip Bouquet",
      slug: "everlasting-hand-crocheted-tulip-bouquet",
      tagline: "5 blooms of hand-crocheted pastel tulips that never fade",
      description: "A bouquet as timeless as your affection. Inspired by The Fourfold's iconic tulip motif, each tulip is painstakingly hand-crocheted with ultra-soft 5-ply milk cotton yarn and mounted on flexible floral wire stems with delicate green foliage. Wrapped in Korean waterproof matte craft paper and tied with a satin bow. Includes a complimentary personalized mini note.",
      price: 1299.00,
      compareAtPrice: 1599.00,
      stock: 15,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80"
      ]),
      categoryId: catFlorals.id,
      subcategoryId: subMap(catFlorals, "crochet-tulips"),
      materials: "Premium Milk Cotton Yarn, Flexible Wire Core, Matte Florist Wrap, Satin Ribbon",
      dimensions: "Height: 35cm | Bouquet Width: 18cm",
      craftDays: 3,
      isFeatured: true,
      isBestSeller: true,
      allowsCustomNote: true,
      allowsWaxSeal: true,
    },
    {
      title: "The Grand Anniversary Keepsake Hamper",
      slug: "grand-anniversary-keepsake-hamper",
      tagline: "Curated artisanal celebration suite in reusable wooden box",
      description: "The ultimate gifting experience. Housed within an artisan pine wood box with sliding lid, this hamper includes: 1 Signature Blossom Explosion Box customized with photos, 2 Hand-Crocheted Forever Tulips, 1 Hand-Poured French Vanilla Soy Candle in amber glass, 1 Wax-Sealed Vintage Love Letter, and 1 Brass Pressed Flower Keychain. Every single component is made by hand in our studio.",
      price: 3499.00,
      compareAtPrice: 4299.00,
      stock: 6,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80"
      ]),
      categoryId: catHampers.id,
      subcategoryId: subMap(catHampers, "anniversary-hampers"),
      materials: "Natural Pine Wood, Soy Wax, Milk Cotton Yarn, 300 GSM Paper, Brass Charm",
      dimensions: "Wooden Box: 28cm x 22cm x 12cm",
      craftDays: 4,
      isFeatured: true,
      isBestSeller: true,
      allowsCustomNote: true,
      allowsWaxSeal: true,
    },
  ];

  for (const p of products) {
    const createdProduct = await prisma.product.create({
      data: p,
    });

    // Add realistic reviews for products
    await prisma.review.createMany({
      data: [
        {
          productId: createdProduct.id,
          userId: customer.id,
          authorName: "Pooja Hegde",
          rating: 5,
          comment: "I was genuinely stunned when I opened the box! The attention to detail in the folds and the wax seal made it feel so personal and luxurious. My partner cried happy tears!",
        },
        {
          productId: createdProduct.id,
          authorName: "Rahul Verma",
          rating: 5,
          comment: "You cannot get this level of craftsmanship in retail shops. Every fold is crisp and the calligraphy on the card was gorgeous. 10/10 will order again.",
        },
      ],
    });
  }

  console.log(`✅ Seeded ${products.length} products with customer reviews.`);

  // 5. Seed Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "FOURFOLD10",
        discountPercent: 10,
        minOrderAmount: 500,
        isActive: true,
      },
      {
        code: "FIRSTFOLD",
        discountAmount: 150,
        minOrderAmount: 999,
        isActive: true,
      },
      {
        code: "LOVEHANDMADE",
        discountPercent: 15,
        minOrderAmount: 1499,
        isActive: true,
      },
    ],
  });

  console.log("✅ Seeded promotional coupons.");

  // 6. Seed a Demo Order for Customer
  const firstProduct = await prisma.product.findFirst();
  if (firstProduct) {
    const demoOrder = await prisma.order.create({
      data: {
        orderNumber: "FF-2026-0819",
        userId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || "+91 98111 22334",
        shippingAddress: customer.address || "Flat 204, Sea Breeze Apartments, Bandra",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400050",
        subtotal: firstProduct.price,
        discountTotal: 0,
        shippingFee: 0,
        finalTotal: firstProduct.price,
        status: OrderStatus.HANDCRAFTING,
        paymentMethod: PaymentMethod.UPI_QR,
        paymentStatus: "PAID",
        paymentRef: "UPI-REF-984729184",
        courierName: "Delhivery Express",
        trackingNumber: "DLH-99882341",
        orderNotes: "Please tie with emerald green ribbon and write: 'Happy 3rd Anniversary, my love!'",
        items: {
          create: [
            {
              productId: firstProduct.id,
              productTitle: firstProduct.title,
              price: firstProduct.price,
              quantity: 1,
              selectedImage: JSON.parse(firstProduct.images)[0],
              customRecipientName: "Vikram & Ananya",
              customMessage: "Happy 3rd Anniversary, my love! To many more folds of our beautiful life together.",
              waxSealColor: "Antique Gold",
              giftWrapOption: "Botanical Sage Linen Wrap",
            },
          ],
        },
      },
    });
    console.log(`✅ Seeded demo order: ${demoOrder.orderNumber}`);
  }

  console.log("🎉 The Fourfold database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
