export type StaticMenuItem = {
  id: string;
  title: string;
  url: string;
  children?: StaticMenuItem[];
};

export const STATIC_MENU: StaticMenuItem[] = [
  { id: "home", title: "Home", url: "/" },
  { id: "sunscreens", title: "Sunscreens", url: "/category/sunscreens" },
  { id: "cleansers", title: "Cleansers", url: "/category/cleansers" },
  { id: "eye-creams", title: "Eye Creams", url: "/category/eye-creams" },
  { id: "makeup", title: "Makeup", url: "/category/makeup" },
  { id: "moisturisers", title: "Moisturisers", url: "/category/moisturisers" },
  { id: "hair", title: "Hair", url: "/category/hairs" },
  { id: "jewellery", title: "Jewellery", url: "/category/shein-uk-jewellery" },
  {
    id: "all-brands",
    title: "All Brands",
    url: "/brand",
    children: [
      { id: "mixsoon", title: "Mixsoon", url: "/category/mixsoon" },
      { id: "aprilskin", title: "Aprilskin", url: "/category/aprilskin" },
      { id: "altriust", title: "Altriust", url: "/category/altriust" },
      {
        id: "bath-body-works",
        title: "Bath & Body Works",
        url: "/category/bath-body-works",
      },
    ],
  },
];
