export type ConsentLanguage = 'en' | 'hi';

export type ConsentCopy = {
  languageName: string;
  title: string;
  intro: string;
  dataHeading: string;
  data: string[];
  purposesHeading: string;
  purposes: string[];
  sharingHeading: string;
  sharing: string;
  retentionHeading: string;
  retention: string;
  rightsHeading: string;
  rights: string;
  rightsLink: string;
  consentLabel: string;
  ageLabel: string;
  termsLabel: string;
  continueLabel: string;
  logOutLabel: string;
  saving: string;
  error: string;
  withdrawnTitle: string;
  withdrawnBody: string;
};

/**
 * The DPDP Section 5 / Rule 3 notice, readable on its own: every data item,
 * every purpose, and how to withdraw, use rights and complain. Mirrors
 * wbillmobile/lib/core/consent_notice.dart; change both, and bump
 * POLICY_VERSION in lib/legal.ts.
 */
export const consentNotice: Record<ConsentLanguage, ConsentCopy> = {
  en: {
    languageName: 'English',
    title: 'Your privacy and WBill',
    intro: 'Before you continue, please read what we collect and why. You choose whether to agree.',
    dataHeading: 'Data we use',
    data: [
      'Your mobile number, and your name, email and photo if you sign in with Google',
      'Your shop name, address, phone, logo and GSTIN',
      'Bills you make: items, prices, totals, dates, and who made the bill',
      'Customer names and mobile numbers you choose to add to a bill',
      'Employee names, mobile numbers or emails you add, and when they last signed in',
      'The days you use WBill, and crash reports from the app (device type and error details)',
    ],
    purposesHeading: 'Why we use it',
    purposes: [
      'To sign you in and keep your account secure',
      'To create, store and share your bills, and work out GST and totals',
      'To show your sales, customers and team in your dashboard',
      'To fix faults, prevent misuse and meet our legal duties',
      'To count overall usage of WBill. We never sell your data or use it for advertising',
    ],
    sharingHeading: 'Who handles it',
    sharing:
      'Google Firebase stores the data, delivers sign-in codes and records crash reports, and may process it outside India. WBill’s administrator can reach account records for support and security. When you share a bill, it goes to the app you choose, such as WhatsApp.',
    retentionHeading: 'How long we keep it',
    retention:
      'For as long as your account is open. If you close it, you lose access at once, and the law requires us to keep the data in restricted storage for one year before erasing it. If an account is unused for three years, we warn you and then erase it.',
    rightsHeading: 'Your choices',
    rights:
      'You can withdraw consent at any time in Profile or Settings, as easily as you give it here. You can also ask to see, correct or erase your data, nominate someone to act for you, raise a grievance, and complain to the Data Protection Board of India.',
    rightsLink: 'How to use your rights',
    consentLabel: 'I consent to WBill using my personal data for the purposes listed above.',
    ageLabel: 'I am 18 years of age or older.',
    termsLabel: 'I accept the Terms of Service.',
    continueLabel: 'Agree and continue',
    logOutLabel: 'Do not agree, log out',
    saving: 'Saving…',
    error: 'We could not save your choice. Check your connection and try again.',
    withdrawnTitle: 'You have withdrawn your consent',
    withdrawnBody:
      'WBill has stopped using your data for this account. You can give consent again below to carry on. To close the account without doing that, use the link to your rights and we will handle it by email.',
  },
  hi: {
    languageName: 'हिन्दी',
    title: 'आपकी निजता और WBill',
    intro: 'आगे बढ़ने से पहले कृपया पढ़ें कि हम कौन-सी जानकारी लेते हैं और क्यों। सहमति देना या न देना आपकी पसंद है।',
    dataHeading: 'हम कौन-सी जानकारी उपयोग करते हैं',
    data: [
      'आपका मोबाइल नंबर, और Google से साइन इन करने पर आपका नाम, ईमेल और फ़ोटो',
      'आपकी दुकान का नाम, पता, फ़ोन, लोगो और GSTIN',
      'आपके बनाए बिल: सामान, दाम, कुल राशि, तारीख़, और बिल किसने बनाया',
      'ग्राहकों के नाम और मोबाइल नंबर, जो आप बिल में जोड़ना चुनते हैं',
      'कर्मचारियों के नाम, मोबाइल नंबर या ईमेल जो आप जोड़ते हैं, और उनके पिछले साइन इन का समय',
      'जिन दिनों आप WBill का उपयोग करते हैं, और ऐप की क्रैश रिपोर्ट (डिवाइस का प्रकार और त्रुटि का विवरण)',
    ],
    purposesHeading: 'हम इसका उपयोग क्यों करते हैं',
    purposes: [
      'आपको साइन इन कराने और आपका खाता सुरक्षित रखने के लिए',
      'आपके बिल बनाने, सहेजने और साझा करने, तथा GST और कुल राशि निकालने के लिए',
      'आपके डैशबोर्ड में बिक्री, ग्राहक और टीम दिखाने के लिए',
      'गड़बड़ियाँ ठीक करने, दुरुपयोग रोकने और क़ानूनी दायित्व निभाने के लिए',
      'WBill के कुल उपयोग की गिनती के लिए। हम आपकी जानकारी कभी नहीं बेचते और न ही विज्ञापन के लिए उपयोग करते हैं',
    ],
    sharingHeading: 'इसे कौन संभालता है',
    sharing:
      'Google Firebase जानकारी सहेजता है, साइन-इन कोड भेजता है और क्रैश रिपोर्ट दर्ज करता है, और यह भारत के बाहर भी प्रोसेस हो सकती है। WBill के एडमिनिस्ट्रेटर सहायता और सुरक्षा के लिए खाते के रिकॉर्ड देख सकते हैं। जब आप बिल साझा करते हैं, तो वह आपके चुने हुए ऐप, जैसे WhatsApp, पर जाता है।',
    retentionHeading: 'हम इसे कब तक रखते हैं',
    retention:
      'जब तक आपका खाता खुला है। खाता बंद करने पर आपकी पहुँच तुरंत समाप्त हो जाती है, और क़ानून के अनुसार हमें मिटाने से पहले जानकारी एक वर्ष तक प्रतिबंधित स्टोरेज में रखनी होती है। यदि कोई खाता तीन वर्ष तक उपयोग में नहीं आता, तो हम आपको सूचित करके उसे मिटा देते हैं।',
    rightsHeading: 'आपके विकल्प',
    rights:
      'आप Profile या Settings में किसी भी समय अपनी सहमति वापस ले सकते हैं, उतनी ही आसानी से जितनी आसानी से यहाँ देते हैं। आप अपनी जानकारी देखने, सुधारने या मिटाने का अनुरोध कर सकते हैं, अपनी ओर से कार्य करने के लिए किसी को नामित कर सकते हैं, शिकायत दर्ज कर सकते हैं, और भारतीय डेटा संरक्षण बोर्ड से शिकायत कर सकते हैं।',
    rightsLink: 'अपने अधिकारों का उपयोग कैसे करें',
    consentLabel: 'मैं WBill को ऊपर बताए गए उद्देश्यों के लिए अपनी व्यक्तिगत जानकारी का उपयोग करने की सहमति देता/देती हूँ।',
    ageLabel: 'मेरी आयु 18 वर्ष या उससे अधिक है।',
    termsLabel: 'मैं सेवा की शर्तें स्वीकार करता/करती हूँ।',
    continueLabel: 'सहमत हूँ, आगे बढ़ें',
    logOutLabel: 'सहमत नहीं हूँ, लॉग आउट करें',
    saving: 'सहेजा जा रहा है…',
    error: 'आपकी पसंद सहेजी नहीं जा सकी। अपना इंटरनेट कनेक्शन जाँचें और फिर कोशिश करें।',
    withdrawnTitle: 'आपने अपनी सहमति वापस ले ली है',
    withdrawnBody:
      'WBill ने इस खाते के लिए आपकी जानकारी का उपयोग बंद कर दिया है। जारी रखने के लिए नीचे फिर से सहमति दें। इसके बिना खाता बंद करने के लिए अधिकारों वाले लिंक का उपयोग करें, हम ईमेल से इसे पूरा करेंगे।',
  },
};
