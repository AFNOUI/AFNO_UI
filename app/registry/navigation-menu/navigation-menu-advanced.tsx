export const data = {
  brandName: "Property Hub",
  rentalLabel: "Rentals",
  servicesLabel: "Services",
  listButtonText: "List Your Property",
  postButtonText: "Post Item",
  rentalItems: [
    {
      name: "Rooms",
      description: "Private and shared room rentals for students and professionals",
      subFeatures: [
        { name: "Find Shared Rooms", routingPath: "#", description: "Discover available shared living spaces" },
        { name: "Find Your Room Partner", routingPath: "#", description: "Connect with compatible roommates" },
        { name: "Feature Your Room", routingPath: "#", description: "List and showcase your available room" },
      ],
    },
    { name: "Hostels", description: "Affordable hostel accommodations for students", subFeatures: [] },
    { name: "Apartments", description: "Modern furnished and unfurnished apartments", subFeatures: [] },
  ],
  listingItems: [
    {
      name: "Room Rental Assistance",
      description: "Expert guidance to list your room or find the perfect shared space",
      subFeatures: [
        { routingPath: "#", name: "For Room Owners", description: "Professional assistance to list and market" },
        { routingPath: "#", name: "For Tenants", description: "Personalized help finding ideal rooms" },
      ],
    },
    {
      name: "Hostel Advisory",
      description: "Comprehensive hostel listing and booking consultation services",
      subFeatures: [
        { routingPath: "#", name: "For Hostel Owners", description: "Management support for listing and operations" },
        { routingPath: "#", name: "For Guests", description: "Recommendations for budget-friendly hostels" },
      ],
    },
    {
      name: "Apartment Consulting",
      description: "Professional apartment rental advisory for owners and renters",
      subFeatures: [
        { routingPath: "#", name: "For Apartment Owners", description: "Guidance on pricing and marketing" },
        { routingPath: "#", name: "For Renters", description: "Assistance to find apartments for families" },
      ],
    },
  ],
};

const dataStr = JSON.stringify(data, null, 2);
export const code =
  'import React from "react";\n' +
  'import { NavigationMenu, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";\n\n' +
  "const data = " +
  dataStr +
  ";\n\n" +
  "export default function NavigationMenuAdvancedExample() {\n" +
  "  return (\n" +
  "    <nav className=\"border-b\">\n" +
  "      <div className=\"flex h-14 items-center px-4\">\n" +
  "        <a href=\"#\" className=\"font-semibold me-6\">{data.brandName}</a>\n" +
  "        <NavigationMenu className=\"hidden md:flex\">\n" +
  "          <NavigationMenuList className=\"gap-1\">\n" +
  "            <a href=\"#\" className={navigationMenuTriggerStyle()}>\n" +
  "              {data.rentalLabel}\n" +
  "            </a>\n" +
  "            <a href=\"#\" className={navigationMenuTriggerStyle()}>\n" +
  "              {data.servicesLabel}\n" +
  "            </a>\n" +
  "          </NavigationMenuList>\n" +
  "        </NavigationMenu>\n" +
  "        <div className=\"ms-auto flex gap-2\">\n" +
  "          <button type=\"button\" className=\"inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4\">\n" +
  "            {data.listButtonText}\n" +
  "          </button>\n" +
  "          <button type=\"button\" className=\"inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent h-9 px-4 text-sm\">\n" +
  "            {data.postButtonText}\n" +
  "          </button>\n" +
  "        </div>\n" +
  "      </div>\n" +
  "    </nav>\n" +
  "  );\n" +
  "}\n";
