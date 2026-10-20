const categoryData = {
  merchant: {
    label: "ব্র্যান্ড, ম্যানুফ্যাকচারিং ও মার্চেন্ট",
    subCategories: {
      "Electronics, Gadgets & Home Appliances": {
        orgLabel: "ব্র্যান্ড / শোরুমের নাম *",
        regLabel: "ট্রেড লাইসেন্স নম্বর (বাধ্যতামূলক) *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (Front & Back) (বাধ্যতামূলক)", required: true },
          { id: "doc_bsti", label: "BSTI বা ওয়ারেন্টি সার্টিফিকেট (যদি থাকে)", required: false }
        ]
      },
      "Cosmetics & Skincare": {
        orgLabel: "ব্র্যান্ড / কসমেটিকস শপ নাম *",
        regLabel: "ট্রেড লাইসেন্স নম্বর (বাধ্যতামূলক) *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true },
          { id: "doc_lab", label: "ল্যাব টেস্ট বা বিএসটিআই সার্টিফিকেট", required: false }
        ]
      },
      "Food, Honey, Organic & Spices": {
        orgLabel: "ফুড ব্র্যান্ড / ফার্মের নাম *",
        regLabel: "ট্রেড লাইসেন্স / DBID নম্বর *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স / DBID কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true },
          { id: "doc_bsti", label: "বিএসটিআই (BSTI) বা নিরাপদ খাদ্য সার্টিফিকেট", required: false }
        ]
      },
      "Medicine & Healthcare": {
        orgLabel: "কোম্পানি / ফার্মেসির নাম *",
        regLabel: "ট্রেড লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_drug", label: "ড্রাগ লাইসেন্স / আয়ুর্বেদিক লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Clothing, Shoes & Leather": {
        orgLabel: "বুটিক / ফ্যাশন হাউসের নাম *",
        regLabel: "ট্রেড লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Online E-commerce & Page Shop": {
        orgLabel: "পেজ / ই-কমার্স শপের নাম *",
        regLabel: "ই-ট্রেড লাইসেন্স বা DBID নম্বর *",
        docs: [
          { id: "doc_dbid", label: "ই-ট্রেড লাইসেন্স বা DBID সার্টিফিকেট (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "স্বত্বাধিকারীর NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Other Merchants & Brands": {
        orgLabel: "প্রতিষ্ঠানের নাম *",
        regLabel: "ট্রেড লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      }
    }
  },
  health: {
    label: "স্বাস্থ্য ও চিকিৎসা সেবা",
    subCategories: {
      "MBBS & General Physician": {
        orgLabel: "চেম্বার / হসপিটালের নাম *",
        regLabel: "বিএমডিসি (BMDC) রেজিস্ট্রেশন নম্বর *",
        docs: [
          { id: "doc_bmdc", label: "বিএমডিসি (BMDC) সার্টিফিকেট (বাধ্যতামূলক)", required: true },
          { id: "doc_mbbs", label: "এমবিবিএস পাসিং সার্টিফিকেট (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "ডাক্তারের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Specialist Doctor": {
        orgLabel: "হাসপাতাল / চেম্বারের নাম *",
        regLabel: "বিএমডিসি (BMDC) নম্বর *",
        docs: [
          { id: "doc_bmdc", label: "বিএমডিসি (BMDC) মূল সনদপত্র (বাধ্যতামূলক)", required: true },
          { id: "doc_spec", label: "পোস্ট-গ্র্যাজুয়েট ডিগ্রি সার্টিফিকেট (FCPS/MS/MD) (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "ডাক্তারের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Dental Surgeon (BDS)": {
        orgLabel: "ডেন্টাল ক্লিনিক / চেম্বারের নাম *",
        regLabel: "বিএমডিসি ডেন্টাল রেজিস্ট্রেশন নম্বর *",
        docs: [
          { id: "doc_bmdc", label: "বিএমডিসি ডেন্টাল কাউন্সিল সনদপত্র (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "ডাক্তারের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Homeopathy & Alternative": {
        orgLabel: "চেম্বার / প্রতিষ্ঠানের নাম *",
        regLabel: "হোমিওপ্যাথি বোর্ড লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_board", label: "বোর্ড লাইসেন্স বা রেজিস্ট্রেশন সার্টিফিকেট (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "চিকিৎসকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Physiotherapist & Nutritionist": {
        orgLabel: "ক্লিনিক / চেম্বারের নাম *",
        regLabel: "প্রফেশনাল কাউন্সিল রেজিস্ট্রেশন নম্বর *",
        docs: [
          { id: "doc_cert", label: "প্রফেশনাল ডিগ্রি / ডিপ্লোমা সার্টিফিকেট (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Other Medical Professionals": {
        orgLabel: "প্রতিষ্ঠানের নাম *",
        regLabel: "অনুমোদন বা লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_cert", label: "পেশাগত সার্টিফিকেট (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      }
    }
  },
  lab: {
    label: "ডায়াগনস্টিক, ল্যাব ও ফার্মেসি",
    subCategories: {
      "Pathology & Blood Lab": {
        orgLabel: "ল্যাব ও ডায়াগনস্টিকের নাম *",
        regLabel: "DGHS লাইসেন্স নম্বর (বাধ্যতামূলক) *",
        docs: [
          { id: "doc_dghs", label: "স্বাস্থ্য অধিদপ্তর (DGHS) লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_trade", label: "ট্রেড লাইসেন্স (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Radiology & Imaging": {
        orgLabel: "সেন্টারের নাম *",
        regLabel: "DGHS লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_dghs", label: "DGHS লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_baec", label: "পরমাণু শক্তি কমিশন (BAEC) ক্লিয়ারেন্স সার্টিফিকেট (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Retail & Wholesale Pharmacy": {
        orgLabel: "ফার্মেসির নাম *",
        regLabel: "ড্রাগ লাইসেন্স (Drug License) নম্বর *",
        docs: [
          { id: "doc_drug", label: "ড্রাগ লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_trade", label: "ট্রেড লাইসেন্স (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "ফার্মাসিস্ট / মালিকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Blood Bank": {
        orgLabel: "ব্লাড ব্যাংকের নাম *",
        regLabel: "DGHS ব্লাড ব্যাংক লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_dghs", label: "DGHS বিশেষ অনুমতিপত্র ও লাইসেন্স (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "পরিচালকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Veterinary & Pet Care": {
        orgLabel: "ক্লিনিক / হাসপাতালের নাম *",
        regLabel: "ভেটেরিনারি কাউন্সিল রেজিস্ট্রেশন নম্বর *",
        docs: [
          { id: "doc_vet", label: "ভেটেরিনারি কাউন্সিল সনদপত্র (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "চিকিৎসকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Other Labs": {
        orgLabel: "প্রতিষ্ঠানের নাম *",
        regLabel: "প্রধান লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      }
    }
  },
  technician: {
    label: "দক্ষ কারিগর ও সার্ভিস টেকনিশিয়ান",
    subCategories: {
      "Electrician & Power": {
        orgLabel: "ওয়ার্কশপ / সার্ভিস সেন্টারের নাম *",
        regLabel: "NID নম্বর (বাধ্যতামূলক) *",
        docs: [
          { id: "doc_nid", label: "জাতীয় পরিচয়পত্র (NID) (বাধ্যতামূলক)", required: true },
          { id: "doc_board", label: "ইলেকট্রিক লাইসেন্স বোর্ডের সার্টিফিকেট (যদি থাকে)", required: false }
        ]
      },
      "AC & Fridge Repair": {
        orgLabel: "ওয়ার্কশপের নাম *",
        regLabel: "NID নম্বর (বাধ্যতামূলক) *",
        docs: [
          { id: "doc_nid", label: "জাতীয় পরিচয়পত্র (NID) কার্ড (বাধ্যতামূলক)", required: true },
          { id: "doc_cert", label: "টেকনিক্যাল ট্রেনিং সার্টিফিকেট", required: false }
        ]
      },
      "CCTV & Security Installer": {
        orgLabel: "প্রতিষ্ঠানের / কোম্পানির নাম *",
        regLabel: "NID নম্বর (বাধ্যতামূলক) *",
        docs: [
          { id: "doc_nid", label: "NID কার্ড (বাধ্যতামূলক)", required: true },
          { id: "doc_trade", label: "ট্রেড লাইসেন্স (যদি থাকে)", required: false }
        ]
      },
      "IT Technician": {
        orgLabel: "সার্ভিস শপের নাম *",
        regLabel: "NID নম্বর (বাধ্যতামূলক) *",
        docs: [
          { id: "doc_nid", label: "জাতীয় পরিচয়পত্র (NID) কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Other Technicians": {
        orgLabel: "প্রতিষ্ঠানের নাম *",
        regLabel: "NID নম্বর (বাধ্যতামূলক) *",
        docs: [
          { id: "doc_nid", label: "NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      }
    }
  },
  legal: {
    label: "পেশাদার, ফ্রিল্যান্সার ও আইনি পরামর্শক",
    subCategories: {
      "Advocate & Legal Advisor": {
        orgLabel: "ল ফার্ম / চেম্বারের নাম *",
        regLabel: "বাংলাদেশ বার কাউন্সিল এনরোলমেন্ট নম্বর *",
        docs: [
          { id: "doc_bar", label: "বার কাউন্সিল সনদপত্র (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "আইজীবীর NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Tax & VAT Consultant - CA": {
        orgLabel: "কনসালটেন্সি ফার্মের নাম *",
        regLabel: "ICAB / NBR মেম্বারশিপ নম্বর *",
        docs: [
          { id: "doc_ca", label: "চার্টার্ড অ্যাকাউন্ট্যান্ট / ট্যাক্স প্র্যাকটিশনার সার্টিফিকেট (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Architect & Civil Engineer": {
        orgLabel: "ফার্ম / কনস্ট্রাকশন কোম্পানির নাম *",
        regLabel: "IEB মেম্বারশিপ নম্বর *",
        docs: [
          { id: "doc_ieb", label: "IEB মেম্বারশিপ বা ডিগ্রি সার্টিফিকেট (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Software Developer": {
        orgLabel: "এজেন্সি / ব্র্যান্ডের নাম *",
        regLabel: "NID নম্বর (বাধ্যতামূলক) *",
        docs: [
          { id: "doc_nid", label: "জাতীয় পরিচয়পত্র (NID) কার্ড (বাধ্যতামূলক)", required: true },
          { id: "doc_port", label: "পোর্টফোলিও বা প্রোফাইল লিংক ডকুমেন্ট", required: false }
        ]
      },
      "Digital Marketer": {
        orgLabel: "এজেন্সি / চ্যানেলের নাম *",
        regLabel: "NID নম্বর (বাধ্যতামূলক) *",
        docs: [
          { id: "doc_nid", label: "NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Other Professionals": {
        orgLabel: "প্রতিষ্ঠানের নাম *",
        regLabel: "লাইসেন্স / NID নম্বর *",
        docs: [
          { id: "doc_nid", label: "NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      }
    }
  },
  education: {
    label: "শিক্ষা ও ইনস্টিটিউট",
    subCategories: {
      "IT & Coding Institute": {
        orgLabel: "ইনস্টিটিউটের নাম *",
        regLabel: "ট্রেড লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স বা কোম্পানি রেজিস্ট্রেশন (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "পরিচালকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Training Center": {
        orgLabel: "ইনস্টিটিউটের নাম *",
        regLabel: "BTEB / BRTA অনুমোদন নম্বর *",
        docs: [
          { id: "doc_auth", label: "সরকারি বোর্ডের অনুমোদনপত্র (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "পরিচালকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "School, College & Coaching": {
        orgLabel: "শিক্ষা প্রতিষ্ঠানের নাম *",
        regLabel: "শিক্ষা বোর্ড অনুমোদন নম্বর *",
        docs: [
          { id: "doc_board", label: "বোর্ড বা শিক্ষা অফিস অনুমতিপত্র (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "প্রধান শিক্ষক / অধ্যক্ষের NID (বাধ্যতামূলক)", required: true }
        ]
      },
      "Madrasah & Education": {
        orgLabel: "মাদ্রাসার নাম *",
        regLabel: "মাদ্রাসা শিক্ষা বোর্ড রেজিস্ট্রেশন নম্বর *",
        docs: [
          { id: "doc_board", label: "মাদ্রাসা বোর্ডের রেজিস্ট্রেশন কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মুহতামিম / সুপারের NID (বাধ্যতামূলক)", required: true }
        ]
      },
      "Other Educational Institutes": {
        orgLabel: "প্রতিষ্ঠানের নাম *",
        regLabel: "রেজিস্ট্রেশন নম্বর *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      }
    }
  },
  logistics: {
    label: "পরিবহন, কুরিয়ার ও লজিস্টিকস",
    subCategories: {
      "Courier & Delivery": {
        orgLabel: "কুরিয়ার কোম্পানির নাম *",
        regLabel: "ট্রেড লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স ও কুরিয়ার লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Rent-A-Car": {
        orgLabel: "এজেন্সির নাম *",
        regLabel: "ট্রেড লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Truck & Covered Van": {
        orgLabel: "পরিবহন সংস্থার নাম *",
        regLabel: "ট্রেড লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স বা সমিতি রেজিস্ট্রেশন (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "C&F Agent": {
        orgLabel: "এজেন্সির নাম *",
        regLabel: "কাস্টমস লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_customs", label: "কাস্টমস লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      },
      "Other Logistics": {
        orgLabel: "প্রতিষ্ঠানের নাম *",
        regLabel: "লাইসেন্স নম্বর *",
        docs: [
          { id: "doc_trade", label: "ট্রেড লাইসেন্স কপি (বাধ্যতামূলক)", required: true },
          { id: "doc_nid", label: "মালিকের NID কার্ড (বাধ্যতামূলক)", required: true }
        ]
      }
    }
  },
  other: {
    label: "অন্যান্য পেশা ও ব্যবসা",
    subCategories: {
      "Other New Business or Services": {
        orgLabel: "ব্যবসায়িক বা পেশাগত নাম *",
        regLabel: "প্রধান রেজিস্ট্রেশন / NID নম্বর *",
        docs: [
          { id: "doc_nid", label: "জাতীয় পরিচয়পত্র (NID) (বাধ্যতামূলক)", required: true },
          { id: "doc_optional", label: "অন্যান্য প্রাসঙ্গিক অনুমোদন (যদি থাকে)", required: false }
        ]
      }
    }
  }
};

let currentStep = 1;
const totalSteps = 6;
let isPhoneVerified = false;

function isValidBDPhone(phone) {
  const regex = /^01[3-9]\d{8}$/;
  return regex.test(phone);
}

function isValidNIDNumber(nid) {
  const regex = /^(\d{10}|\d{13}|\d{17})$/;
  return regex.test(nid);
}

function onMainCategoryChange() {
  const catKey = document.getElementById('mainCategory').value;
  const subCatSelect = document.getElementById('subCategory');
  const subContainer = document.getElementById('subCategoryContainer');

  subCatSelect.innerHTML = '<option value="">-- সাব-ক্যাটাগরি সিলেক্ট করুন --</option>';
  document.getElementById('mainCategory').classList.remove('input-error');

  if (catKey && categoryData[catKey]) {
    const subCategories = categoryData[catKey].subCategories;
    for (const subName in subCategories) {
      const opt = document.createElement('option');
      opt.value = subName;
      opt.innerText = subName;
      subCatSelect.appendChild(opt);
    }
    subContainer.classList.remove('hidden');
  } else {
    subContainer.classList.add('hidden');
  }
  document.getElementById('dynamicDocumentFields').innerHTML = '';
}

function onSubCategoryChange() {
  const catKey = document.getElementById('mainCategory').value;
  const subCatName = document.getElementById('subCategory').value;
  document.getElementById('subCategory').classList.remove('input-error');

  if (catKey && subCatName && categoryData[catKey].subCategories[subCatName]) {
    const subData = categoryData[catKey].subCategories[subCatName];
    document.getElementById('lbl_org_name').innerText = subData.orgLabel;
    document.getElementById('lbl_reg_no').innerText = subData.regLabel;

    const docContainer = document.getElementById('dynamicDocumentFields');
    docContainer.innerHTML = '';
    
    subData.docs.forEach((doc) => {
      const box = document.createElement('div');
      box.className = "border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-2xl p-4 transition bg-slate-900/40 relative";
      box.setAttribute('data-doc-id', doc.id);
      box.setAttribute('data-required', doc.required ? 'true' : 'false');
      
      box.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-lg">
            <i class="fa-solid fa-file-arrow-up"></i>
          </div>
          <div class="text-left flex-1">
            <p id="label-${doc.id}" class="text-xs font-semibold text-gray-200">${doc.label}</p>
            <p class="text-[10px] text-gray-500">একাধিক ফাইল/পাতা সিলেক্ট করতে পারবেন (PDF, PNG বা JPG)</p>
          </div>
          <input type="file" id="${doc.id}" multiple class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onchange="updateFileLabel(event, 'label-${doc.id}')">
        </div>
      `;
      docContainer.appendChild(box);
    });
  }
}

function updateFileLabel(e, labelId) {
  const files = e.target.files;
  const box = e.target.closest('.border-dashed');
  if (files && files.length > 0) {
    let fileNames = Array.from(files).map(f => f.name).join(', ');
    document.getElementById(labelId).innerHTML = `<span class="text-emerald-400"><i class="fa-solid fa-check-circle mr-1"></i> (${files.length}টি ফাইল নির্বাচিত): ${fileNames}</span>`;
    if (box) box.classList.remove('input-error');
  }
}

// Step 3 OTP Verification
function verifyOtpCode() {
  const otpInput = document.getElementById('registerOtp').value.trim();
  const statusText = document.getElementById('otpStatusText');

  if (otpInput === "1234") {
    isPhoneVerified = true;
    statusText.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-check-circle"></i> মোবাইল নম্বর সফলভাবে ভেরিফাইড হয়েছে!</span>`;
    document.getElementById('registerOtp').classList.remove('input-error');
    alert("ওটিপি সফলভাবে যাচাই করা হয়েছে! এখন পরবর্তী ধাপে যেতে পারেন।");
  } else {
    isPhoneVerified = false;
    document.getElementById('registerOtp').classList.add('input-error');
    statusText.innerHTML = `<span class="text-red-400 font-bold">ভুল ওটিপি কোড! সঠিক কোড (1234) দিন।</span>`;
  }
}

function validateCurrentStep() {
  let isValid = true;

  if (currentStep === 1) {
    const cat = document.getElementById('mainCategory');
    const sub = document.getElementById('subCategory');

    if (!cat.value) { cat.classList.add('input-error'); isValid = false; } else { cat.classList.remove('input-error'); }
    if (!sub.value) { sub.classList.add('input-error'); isValid = false; } else { sub.classList.remove('input-error'); }

    if (!isValid) {
      alert("অনুগ্রহ করে মূল ক্যাটাগরি এবং সাব-ক্যাটাগরি দুটিই নির্বাচন করুন!");
      return false;
    }
  }

  if (currentStep === 2) {
    const name = document.getElementById('name');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    if (!name.value.trim()) {
      name.classList.add('input-error');
      isValid = false;
    } else {
      name.classList.remove('input-error');
    }

    const rawPhone = phone.value.trim();
    if (!isValidBDPhone(rawPhone)) {
      phone.classList.add('input-error');
      alert("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01700000000)।");
      return false;
    } else {
      phone.classList.remove('input-error');
      document.getElementById('displayPhoneNo').innerText = rawPhone;
    }

    // Password validation
    if (!password || !password.value || password.value.length < 6) {
      if (password) password.classList.add('input-error');
      alert("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে!");
      return false;
    } else {
      if (password) password.classList.remove('input-error');
    }

    if (confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.classList.add('input-error');
      alert("দুটি পাসওয়ার্ড মিলছে না! পুনরায় পরীক্ষা করুন।");
      return false;
    } else if (confirmPassword) {
      confirmPassword.classList.remove('input-error');
    }
  }

  if (currentStep === 3) {
    if (!isPhoneVerified) {
      document.getElementById('registerOtp').classList.add('input-error');
      alert("এগিয়ে যাওয়ার আগে অবশ্যই সঠিক ওটিপি (1234) দিয়ে ভেরিফাই করুন!");
      return false;
    }
  }

  if (currentStep === 4) {
    const orgName = document.getElementById('org_name');
    const regNo = document.getElementById('reg_no');
    const orgAddress = document.getElementById('org_address');

    if (!orgName.value.trim()) { orgName.classList.add('input-error'); isValid = false; } else { orgName.classList.remove('input-error'); }
    
    const regValue = regNo.value.trim();
    if (!regValue || regValue.length < 4) {
      regNo.classList.add('input-error');
      alert("সঠিক লাইসেন্স / রেজিস্ট্রেশন / NID নম্বর দিন!");
      isValid = false;
    } else {
      const labelText = document.getElementById('lbl_reg_no').innerText;
      if (labelText.includes("NID") && !isValidNIDNumber(regValue)) {
        regNo.classList.add('input-error');
        alert("সঠিক জাতীয় পরিচয়পত্র (NID) নম্বর দিন! (১০, ১৩ বা ১৭ ডিজিট)");
        isValid = false;
      } else {
        regNo.classList.remove('input-error');
      }
    }

    if (!orgAddress.value.trim()) { orgAddress.classList.add('input-error'); isValid = false; } else { orgAddress.classList.remove('input-error'); }
    if (!isValid) return false;
  }

  if (currentStep === 5) {
    const mainCat = document.getElementById('mainCategory').value;
    const subCat = document.getElementById('subCategory').value;

    if (categoryData[mainCat] && categoryData[mainCat].subCategories[subCat]) {
      const docsConfig = categoryData[mainCat].subCategories[subCat].docs;
      docsConfig.forEach(doc => {
        if (doc.required) {
          const fileInput = document.getElementById(doc.id);
          const box = fileInput ? fileInput.closest('.border-dashed') : null;
          if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            if (box) box.classList.add('input-error');
            isValid = false;
          } else {
            if (box) box.classList.remove('input-error');
          }
        }
      });
    }

    if (!isValid) {
      alert("অনুগ্রহ করে সকল বাধ্যতামূলক ভেরিফিকেশন ফাইল আপলোড করুন!");
      return false;
    }
  }

  return isValid;
}

async function changeStep(delta) {
  if (delta === 1) {
    if (!validateCurrentStep()) return;

    if (currentStep === totalSteps) {
      await submitRegistrationToSupabase();
      return;
    }
  }

  currentStep += delta;
  updateUI();
}

async function submitRegistrationToSupabase() {
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> সেভ করা হচ্ছে...`;
  nextBtn.disabled = true;

  try {
    const mainCat = document.getElementById('mainCategory').value;
    const subCat = document.getElementById('subCategory').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password') ? document.getElementById('password').value : '';
    const orgName = document.getElementById('org_name').value;
    const regNo = document.getElementById('reg_no').value;
    const orgAddress = document.getElementById('org_address').value;

    let profileImageUrl = '';
    const profileImgInput = document.getElementById('profileImageInput');
    if (profileImgInput && profileImgInput.files && profileImgInput.files[0]) {
      const pFile = profileImgInput.files[0];
      const pExt = pFile.name.split('.').pop();
      const pFileName = `profile_${Date.now()}_${Math.random().toString(36).substring(2)}.${pExt}`;

      const { data: pUploadData, error: pUploadError } = await supabaseClient.storage
        .from('RegisterData')
        .upload(pFileName, pFile);

      if (!pUploadError) {
        const { data: pUrlData } = supabaseClient.storage.from('RegisterData').getPublicUrl(pFileName);
        profileImageUrl = pUrlData ? pUrlData.publicUrl : '';
      }
    }

    let uploadedDocs = [];
    if (categoryData[mainCat] && categoryData[mainCat].subCategories[subCat]) {
      const docsConfig = categoryData[mainCat].subCategories[subCat].docs;
      for (let doc of docsConfig) {
        const fileInput = document.getElementById(doc.id);
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabaseClient.storage
              .from('RegisterData')
              .upload(fileName, file);

            if (uploadError) {
              throw new Error("ফাইল আপলোড ব্যর্থ হয়েছে: " + uploadError.message);
            } else {
              const { data: urlData } = supabaseClient.storage.from('RegisterData').getPublicUrl(fileName);
              uploadedDocs.push({
                doc_type: doc.id,
                file_name: file.name,
                file_url: urlData ? urlData.publicUrl : ''
              });
            }
          }
        }
      }
    }

    const { data, error } = await supabaseClient
      .from('registrations')
      .insert([
        {
          main_category: mainCat,
          sub_category: subCat,
          full_name: name,
          phone_number: phone,
          email: email,
          password_hash: password, // Supabase-এ পাসওয়ার্ড পাঠানো হচ্ছে
          org_name: orgName,
          registration_number: regNo,
          org_address: orgAddress,
          profile_image: profileImageUrl,
          documents: uploadedDocs,
          status: 'pending'
        }
      ]);

    if (error) throw error;

    alert("রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে!");
    window.location.href = "login.html";

  } catch (err) {
    console.error("Submission Error:", err);
    alert("রেজিস্ট্রেশন সাবমিট করতে সমস্যা হয়েছে: " + (err.message || "Unknown error"));
    nextBtn.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i> অ্যাকাউন্ট নিশ্চিত করুন`;
    nextBtn.disabled = false;
  }
}

function updateUI() {
  for (let i = 1; i <= totalSteps; i++) {
    document.getElementById(`step-content-${i}`).classList.toggle('hidden', i !== currentStep);
  }

  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
  document.getElementById('progress-bar').style.width = `${progressPercent}%`;

  for (let i = 1; i <= totalSteps; i++) {
    const circle = document.getElementById(`step-circle-${i}`);
    if (i < currentStep) {
      circle.className = "step-circle w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold border-2 border-emerald-500 bg-emerald-600 text-white text-xs shadow-lg shadow-emerald-500/30";
      circle.innerHTML = `<i class="fa-solid fa-check text-xs"></i>`;
    } else if (i === currentStep) {
      circle.className = "step-circle w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold border-2 border-blue-400 bg-blue-600 text-white text-xs shadow-lg shadow-blue-500/30 scale-110";
      circle.innerHTML = i;
    } else {
      circle.className = "step-circle w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold border-2 border-gray-700 bg-gray-900 text-gray-400 text-xs";
      circle.innerHTML = i;
    }
  }

  document.getElementById('prevBtn').classList.toggle('hidden', currentStep === 1);

  const nextBtn = document.getElementById('nextBtn');
  if (currentStep === totalSteps) {
    nextBtn.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i> অ্যাকাউন্ট নিশ্চিত করুন`;
    nextBtn.className = "px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 transition ml-auto";
    
    const catKey = document.getElementById('mainCategory').value;
    const subVal = document.getElementById('subCategory').value;

    document.getElementById('rev-cat').innerText = categoryData[catKey] ? categoryData[catKey].label : 'N/A';
    document.getElementById('rev-subcat').innerText = subVal || 'N/A';
    document.getElementById('rev-name').innerText = document.getElementById('name').value || 'প্রদান করা হয়নি';
    document.getElementById('rev-phone').innerText = document.getElementById('phone').value || 'প্রদান করা হয়নি';
    document.getElementById('rev-org').innerText = document.getElementById('org_name').value || 'প্রদান করা হয়নি';
    document.getElementById('rev-reg').innerText = document.getElementById('reg_no').value || 'প্রদান করা হয়নি';
  } else {
    nextBtn.innerHTML = `পরবর্তী <i class="fa-solid fa-arrow-right ml-1"></i>`;
    nextBtn.className = "px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition ml-auto";
  }
}