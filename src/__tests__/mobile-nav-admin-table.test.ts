import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

describe("Mobile Navigation, Popover Overflow and Admin Table Layout", () => {
  const rootDir = path.resolve(__dirname, "..");

  it("should verify admin horoscope matches page contains the 7 columns matching Image 2", () => {
    const adminPageContent = fs.readFileSync(
      path.join(rootDir, "app/admin/horoscope-matches/page.tsx"),
      "utf-8"
    );

    assert.ok(adminPageContent.includes("User Name / DOB/TOB"), "Missing User Name / DOB/TOB");
    assert.ok(adminPageContent.includes("Bride/Groom Name"), "Missing Bride/Groom Name");
    assert.ok(adminPageContent.includes("Mobile Number"), "Missing Mobile Number");
    assert.ok(adminPageContent.includes("Marketing Consent"), "Missing Marketing Consent");
    assert.ok(adminPageContent.includes("Score"), "Missing Score");
    assert.ok(adminPageContent.includes("Date Checked"), "Missing Date Checked");
    assert.ok(adminPageContent.includes("Action"), "Missing Action");
    assert.ok(adminPageContent.includes("colSpan={7}"), "Missing colSpan={7}");
    assert.ok(adminPageContent.includes("formatDateDMY"), "Missing formatDateDMY");
    assert.ok(adminPageContent.includes("formatTimeClean"), "Missing formatTimeClean");
    assert.ok(adminPageContent.includes("formatDateChecked"), "Missing formatDateChecked");
    assert.ok(adminPageContent.includes("NOT PROVIDED"), "Missing NOT PROVIDED");
  });

  it("should verify overlapping bottom-6 left-4 button is removed from dashboard sidebar", () => {
    const sidebarContent = fs.readFileSync(
      path.join(rootDir, "components/dashboard/dashboard-sidebar.tsx"),
      "utf-8"
    );
    assert.ok(!sidebarContent.includes("fixed bottom-6 left-4"), "Overlapping button still present");
    assert.ok(sidebarContent.includes("km:open-sidebar"), "Sidebar does not listen to km:open-sidebar");
  });

  it("should verify header has mobile hamburger menu button next to user avatar", () => {
    const headerContent = fs.readFileSync(
      path.join(rootDir, "components/shared/header.tsx"),
      "utf-8"
    );
    assert.ok(headerContent.includes("km:open-sidebar"), "Header does not dispatch km:open-sidebar");
    assert.ok(headerContent.includes("lg:hidden"), "Header mobile hamburger should be lg:hidden");
    assert.ok(headerContent.includes("fixed inset-x-4 top-16 sm:absolute"), "Header dropdowns must be fixed inset-x-4 top-16");
    assert.ok(headerContent.includes("sm:hidden fixed inset-0 top-16"), "Header mobile backdrop missing");
  });
});
