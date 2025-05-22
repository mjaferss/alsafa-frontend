'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// أنواع اللغات المدعومة
export type Language = 'ar' | 'en';

// نوع سياق اللغة
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translate: (key: string) => string;
  isRTL: boolean;
}

// قاموس الترجمات
export const translations: Record<string, Record<Language, string>> = {
  // العناصر المشتركة
  welcome: { ar: 'مرحباً', en: 'Welcome' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  
  // الداشبورد
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  totalUsers: { ar: 'إجمالي المستخدمين', en: 'Total Users' },
  totalProperties: { ar: 'إجمالي الشقق', en: 'Total Apartments' },
  totalDepartments: { ar: 'إجمالي الأقسام', en: 'Total Departments' },
  totalBuildings: { ar: 'إجمالي المباني', en: 'Total Buildings' },
  totalPurchases: { ar: 'إجمالي المشتريات', en: 'Total Purchases' },
  maintenanceRequests: { ar: 'طلبات الصيانة', en: 'Maintenance Requests' },
  viewAll: { ar: 'عرض الكل', en: 'View All' },
  
  // صفحة المستخدمين
  userManagement: { ar: 'إدارة المستخدمين', en: 'User Management' },
  usersManagement: { ar: 'إدارة المستخدمين', en: 'Users Management' },
  addUser: { ar: 'إضافة مستخدم', en: 'Add User' },
  addNewUser: { ar: 'إضافة مستخدم جديد', en: 'Add New User' },
  registerNewUser: { ar: 'تسجيل مستخدم جديد', en: 'Register New User' },
  registerUser: { ar: 'تسجيل المستخدم', en: 'Register User' },
  usersList: { ar: 'قائمة المستخدمين', en: 'Users List' },
  userName: { ar: 'اسم المستخدم', en: 'User Name' },
  userEmail: { ar: 'البريد الإلكتروني', en: 'Email' },
  userPhoneNumber: { ar: 'رقم الهاتف', en: 'Phone Number' },
  userRoleLabel: { ar: 'الدور', en: 'Role' },
  userStatus: { ar: 'حالة المستخدم', en: 'User Status' },
  userCreatedAt: { ar: 'تاريخ الإنشاء', en: 'Created At' },
  userLastLogin: { ar: 'آخر تسجيل دخول', en: 'Last Login' },
  actions: { ar: 'الإجراءات', en: 'Actions' },
  viewButton: { ar: 'عرض', en: 'View' },
  editButton: { ar: 'تعديل', en: 'Edit' },
  editUser: { ar: 'تعديل المستخدم', en: 'Edit User' },
  deleteButton: { ar: 'حذف', en: 'Delete' },
  changePassword: { ar: 'تغيير كلمة المرور', en: 'Change Password' },
  activeStatus: { ar: 'نشط', en: 'Active' },
  inactiveStatus: { ar: 'غير نشط', en: 'Inactive' },
  deactivateUser: { ar: 'تعطيل المستخدم', en: 'Deactivate User' },
  confirmDelete: { ar: 'هل أنت متأكد من تعطيل هذا المستخدم؟', en: 'Are you sure you want to deactivate this user?' },
  errorDeactivatingUser: { ar: 'فشل في تعطيل المستخدم', en: 'Failed to deactivate user' },
  accessDenied: { ar: 'تم رفض الوصول. يجب أن تكون مديرًا لعرض هذه الصفحة.', en: 'Access denied. You must be an admin to view this page.' },
  accountInfo: { ar: 'معلومات الحساب', en: 'Account Information' },
  admin: { ar: 'مدير النظام', en: 'Admin' },
  user: { ar: 'مستخدم', en: 'User' },
  notAvailable: { ar: 'غير متوفر', en: 'Not Available' },
  editProfile: { ar: 'تعديل الملف الشخصي', en: 'Edit Profile' },
  quickLinks: { ar: 'روابط سريعة', en: 'Quick Links' },
  manageProperties: { ar: 'إدارة العقارات', en: 'Manage Properties' },
  manageRequests: { ar: 'إدارة الطلبات', en: 'Manage Requests' },
  manageUsers: { ar: 'إدارة المستخدمين', en: 'Manage Users' },
  
  // صفحة الأقسام
  departments: { ar: 'الأقسام', en: 'Departments' },
  department: { ar: 'القسم', en: 'Department' },
  addDepartment: { ar: 'إضافة قسم', en: 'Add Department' },
  editDepartment: { ar: 'تعديل القسم', en: 'Edit Department' },
  departmentName: { ar: 'اسم القسم', en: 'Department Name' },
  departmentCode: { ar: 'رمز القسم', en: 'Department Code' },
  searchDepartments: { ar: 'بحث في الأقسام', en: 'Search Departments' },
  noDepartmentsFound: { ar: 'لم يتم العثور على أقسام', en: 'No Departments Found' },
  confirmDeleteDepartment: { ar: 'تأكيد حذف القسم', en: 'Confirm Department Deletion' },
  confirmDeleteDepartmentMessage: { ar: 'هل أنت متأكد من حذف هذا القسم؟', en: 'Are you sure you want to delete this department?' },
  departmentDeletedSuccessfully: { ar: 'تم حذف القسم بنجاح', en: 'Department deleted successfully' },
  errorDeletingDepartment: { ar: 'حدث خطأ أثناء حذف القسم', en: 'Error deleting department' },
  departmentActivatedSuccessfully: { ar: 'تم تفعيل القسم بنجاح', en: 'Department activated successfully' },
  departmentDeactivatedSuccessfully: { ar: 'تم تعطيل القسم بنجاح', en: 'Department deactivated successfully' },
  errorTogglingDepartmentStatus: { ar: 'حدث خطأ أثناء تغيير حالة القسم', en: 'Error toggling department status' },
  errorFetchingDepartments: { ar: 'حدث خطأ أثناء جلب الأقسام', en: 'Error fetching departments' },
  departmentAddedSuccessfully: { ar: 'تم إضافة القسم بنجاح', en: 'Department added successfully' },
  errorAddingDepartment: { ar: 'حدث خطأ أثناء إضافة القسم', en: 'Error adding department' },
  departmentUpdatedSuccessfully: { ar: 'تم تحديث القسم بنجاح', en: 'Department updated successfully' },
  errorUpdatingDepartment: { ar: 'حدث خطأ أثناء تحديث القسم', en: 'Error updating department' },
  saveDepartment: { ar: 'حفظ القسم', en: 'Save Department' },
  viewDepartment: { ar: 'عرض القسم', en: 'View Department' },
  departmentDetails: { ar: 'تفاصيل القسم', en: 'Department Details' },
  departmentNotFound: { ar: 'لم يتم العثور على القسم', en: 'Department Not Found' },
  updatedAtTime: { ar: 'تاريخ التعديل', en: 'Updated At' },
  updatedByUser: { ar: 'تم التعديل بواسطة', en: 'Updated By' },
  
  // صفحة المباني
  buildings: { ar: 'المباني', en: 'Buildings' },
  building: { ar: 'المبنى', en: 'Building' },
  addBuilding: { ar: 'إضافة مبنى', en: 'Add Building' },
  editBuilding: { ar: 'تعديل المبنى', en: 'Edit Building' },
  buildingName: { ar: 'اسم المبنى', en: 'Building Name' },
  buildingCode: { ar: 'رمز المبنى', en: 'Building Code' },
  searchBuildings: { ar: 'بحث في المباني', en: 'Search Buildings' },
  noBuildingsFound: { ar: 'لم يتم العثور على مباني', en: 'No Buildings Found' },
  confirmDeleteBuilding: { ar: 'تأكيد حذف المبنى', en: 'Confirm Building Deletion' },
  confirmDeleteBuildingMessage: { ar: 'هل أنت متأكد من حذف هذا المبنى؟', en: 'Are you sure you want to delete this building?' },
  buildingDeletedSuccessfully: { ar: 'تم حذف المبنى بنجاح', en: 'Building deleted successfully' },
  errorDeletingBuilding: { ar: 'حدث خطأ أثناء حذف المبنى', en: 'Error deleting building' },
  buildingActivatedSuccessfully: { ar: 'تم تفعيل المبنى بنجاح', en: 'Building activated successfully' },
  buildingDeactivatedSuccessfully: { ar: 'تم تعطيل المبنى بنجاح', en: 'Building deactivated successfully' },
  errorTogglingBuilding: { ar: 'حدث خطأ أثناء تغيير حالة المبنى', en: 'Error toggling building status' },
  errorFetchingBuildings: { ar: 'حدث خطأ أثناء جلب المباني', en: 'Error fetching buildings' },
  buildingAddedSuccessfully: { ar: 'تم إضافة المبنى بنجاح', en: 'Building added successfully' },
  errorAddingBuilding: { ar: 'حدث خطأ أثناء إضافة المبنى', en: 'Error adding building' },
  buildingUpdatedSuccessfully: { ar: 'تم تحديث المبنى بنجاح', en: 'Building updated successfully' },
  errorUpdatingBuilding: { ar: 'حدث خطأ أثناء تحديث المبنى', en: 'Error updating building' },
  errorUpdatingCost: { ar: 'حدث خطأ أثناء تحديث التكلفة', en: 'Error updating cost' },
  name: { ar: 'الاسم', en: 'Name' },
  code: { ar: 'الرمز', en: 'Code' },
  createdAt: { ar: 'تاريخ الإنشاء', en: 'Created At' },
  createdBy: { ar: 'المنشئ', en: 'Created By' },
  itemStatus: { ar: 'الحالة', en: 'Status' },
  active: { ar: 'نشط', en: 'Active' },
  inactive: { ar: 'غير نشط', en: 'Inactive' },
  deactivate: { ar: 'تعطيل', en: 'Deactivate' },
  activate: { ar: 'تفعيل', en: 'Activate' },
  view: { ar: 'عرض', en: 'View' },
  edit: { ar: 'تعديل', en: 'Edit' },
  delete: { ar: 'حذف', en: 'Delete' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  save: { ar: 'حفظ', en: 'Save' },
  search: { ar: 'بحث', en: 'Search' },
  
  // الصفحة الرئيسية
  heroTitle: { ar: 'نظام إدارة العقارات', en: 'Property Management System' },
  heroSubtitle: { ar: 'نظام متكامل لإدارة العقارات والمرافق', en: 'Integrated system for property and facility management' },
  getStarted: { ar: 'ابدأ الآن', en: 'Get Started' },
  
  // التنقل
  home: { ar: 'الرئيسية', en: 'Home' },
  about: { ar: 'عن النظام', en: 'About' },
  services: { ar: 'الخدمات', en: 'Services' },
  contact: { ar: 'اتصل بنا', en: 'Contact' },
  
  // رسائل التحقق
  loginError: { ar: 'خطأ في البريد الإلكتروني أو كلمة المرور', en: 'Invalid email or password' },
  registerError: { ar: 'حدث خطأ أثناء التسجيل', en: 'Error during registration' },
  forgotPassword: { ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?' },
  loggingIn: { ar: 'جاري تسجيل الدخول...', en: 'Logging in...' },
  registering: { ar: 'جاري التسجيل...', en: 'Registering...' },
  
  // أزرار التنقل
  rowsPerPage: { ar: 'عدد الصفوف في الصفحة', en: 'Rows per page' },
  of: { ar: 'من', en: 'of' },
  back: { ar: 'رجوع', en: 'Back' },
  
  // تغيير اللغة
  switchToArabic: { ar: 'العربية', en: 'العربية' },
  switchToEnglish: { ar: 'English', en: 'English' },

  // أنواع الشقق
  apartmentTypes: { ar: 'نوع الشقة', en: 'Apartment Type' },
  apartmentTypeRent: { ar: 'إيجار', en: 'Rent' },
  apartmentTypeSold: { ar: 'مباعة', en: 'Sold' },
  apartmentTypeEmpty: { ar: 'فارغة', en: 'Empty' },
  apartmentTypePublic: { ar: 'ملكية عامة', en: 'Public Property' },
  apartmentTypePreparation: { ar: 'قيد التجهيز', en: 'Under Preparation' },
  apartmentTypeOther: { ar: 'أخرى', en: 'Other' },
  
  // صفحة الشقق
  apartments: { ar: 'الشقق', en: 'Apartments' },
  addApartment: { ar: 'إضافة شقة', en: 'Add Apartment' },
  editApartment: { ar: 'تعديل الشقة', en: 'Edit Apartment' },
  apartmentNumber: { ar: 'رقم الشقة', en: 'Apartment Number' },
  apartmentCode: { ar: 'كود الشقة', en: 'Apartment Code' },
  totalAmount: { ar: 'المبلغ الإجمالي', en: 'Total Amount' },
  apartmentType: { ar: 'نوع الشقة', en: 'Apartment Type' },
  selectDepartment: { ar: 'اختر القسم', en: 'Select Department' },
  selectBuilding: { ar: 'اختر المبنى', en: 'Select Building' },
  selectApartmentType: { ar: 'اختر نوع الشقة', en: 'Select Apartment Type' },
  noApartmentsFoundList: { ar: 'لم يتم العثور على شقق', en: 'No Apartments Found' },
  confirmDeleteApartmentMessage: { ar: 'هل أنت متأكد من حذف هذه الشقة؟', en: 'Are you sure you want to delete this apartment?' },
  deactivateApartment: { ar: 'تعطيل الشقة', en: 'Deactivate Apartment' },
  activateApartment: { ar: 'تفعيل الشقة', en: 'Activate Apartment' },
  confirmDeactivateApartmentMessage: { ar: 'هل أنت متأكد من تعطيل هذه الشقة؟', en: 'Are you sure you want to deactivate this apartment?' },
  confirmActivateApartmentMessage: { ar: 'هل أنت متأكد من تفعيل هذه الشقة؟', en: 'Are you sure you want to activate this apartment?' },
  apartmentDeletedSuccessfully: { ar: 'تم حذف الشقة بنجاح', en: 'Apartment deleted successfully' },
  errorDeletingApartment: { ar: 'حدث خطأ أثناء حذف الشقة', en: 'Error deleting apartment' },
  apartmentActivatedSuccessfully: { ar: 'تم تفعيل الشقة بنجاح', en: 'Apartment activated successfully' },
  apartmentDeactivatedSuccessfully: { ar: 'تم تعطيل الشقة بنجاح', en: 'Apartment deactivated successfully' },
  errorTogglingApartmentStatus: { ar: 'حدث خطأ أثناء تغيير حالة الشقة', en: 'Error toggling apartment status' },
  errorFetchingApartments: { ar: 'حدث خطأ أثناء جلب الشقق', en: 'Error fetching apartments' },
  apartmentAddedSuccessfully: { ar: 'تم إضافة الشقة بنجاح', en: 'Apartment added successfully' },
  errorAddingApartment: { ar: 'حدث خطأ أثناء إضافة الشقة', en: 'Error adding apartment' },
  apartmentUpdatedSuccessfully: { ar: 'تم تحديث الشقة بنجاح', en: 'Apartment updated successfully' },
  errorUpdatingApartment: { ar: 'حدث خطأ أثناء تحديث الشقة', en: 'Error updating apartment' },
  errorFetchingApartment: { ar: 'حدث خطأ أثناء جلب بيانات الشقة', en: 'Error fetching apartment data' },
  saveApartment: { ar: 'حفظ الشقة', en: 'Save Apartment' },
  
  // المفاتيح المفقودة التي تم إضافتها
  searchApartments: { ar: 'بحث عن شقق', en: 'Search Apartments' },
  
  // المفاتيح المفقودة في صفحة عرض الشقة
  apartmentDetailsView: { ar: 'تفاصيل الشقة', en: 'Apartment Details' },
  backToApartments: { ar: 'العودة إلى الشقق', en: 'Back to Apartments' },
  basicInformation: { ar: 'المعلومات الأساسية', en: 'Basic Information' },
  metaInformation: { ar: 'معلومات إضافية', en: 'Meta Information' },
  confirmDeleteApartment: { ar: 'تأكيد حذف الشقة', en: 'Confirm Delete Apartment' },
  pleaseLogin: { ar: 'الرجاء تسجيل الدخول', en: 'Please Login' },
  noPhoneNumber: { ar: 'لا يوجد رقم هاتف', en: 'No Phone Number' },

  // طلبات الصيانة والشقق
  maintenanceType: { ar: 'نوع الصيانة', en: 'Maintenance Type' },
  selectMaintenanceType: { ar: 'اختر نوع الصيانة', en: 'Select Maintenance Type' },
  costItems: { ar: 'عناصر التكلفة', en: 'Cost Items' },
  addNewCostItem: { ar: 'إضافة عنصر تكلفة جديد', en: 'Add New Cost Item' },
  classificationType: { ar: 'نوع التصنيف', en: 'Classification Type' },
  selectClassificationType: { ar: 'اختر نوع التصنيف', en: 'Select Classification Type' },
  cost: { ar: 'التكلفة', en: 'Cost' },
  quantity: { ar: 'الكمية', en: 'Quantity' },
  notes: { ar: 'ملاحظات', en: 'Notes' },
  selectApartmentHelp: { ar: 'اختر الشقة المطلوب صيانتها', en: 'Select the apartment that needs maintenance' },
  // مفاتيح متعلقة بطلب الصيانة
  maintenanceDetails: { ar: 'تفاصيل الصيانة', en: 'Maintenance Details' },
  saveRequest: { ar: 'حفظ الطلب', en: 'Save Request' },
  saving: { ar: 'جاري الحفظ...', en: 'Saving...' },
  loading: { ar: 'جاري التحميل...', en: 'Loading...' },
  apartmentInactiveError: { ar: 'هذه الشقة غير نشطة ولا يمكنك طلب صيانة لها', en: 'This apartment is inactive and you cannot create a maintenance request for it' },
  selectMaintenanceTypeHelp: { ar: 'اختر نوع الصيانة المطلوبة', en: 'Select the type of maintenance required' },
  enterNotesPlaceholder: { ar: 'أدخل أي ملاحظات إضافية حول طلب الصيانة...', en: 'Enter any additional notes about the maintenance request...' },
  notesHelperText: { ar: 'يمكنك إضافة أي تفاصيل إضافية تساعد في فهم طلب الصيانة', en: 'You can add any additional details that help understand the maintenance request' },
  noCostItemsMessage: { ar: 'لا توجد عناصر تكلفة', en: 'No Cost Items' },
  addCostItemsHelp: { ar: 'قم بإضافة عناصر التكلفة باستخدام النموذج أدناه', en: 'Add cost items using the form below' },
  classificationTypeHelp: { ar: 'اختر نوع التصنيف المناسب', en: 'Select the appropriate classification type' },
  costHelperText: { ar: 'أدخل تكلفة العنصر', en: 'Enter the cost of the item' },
  quantityHelperText: { ar: 'أدخل الكمية المطلوبة', en: 'Enter the required quantity' },
  totalHelperText: { ar: 'المجموع الكلي للعنصر', en: 'Total cost of the item' },
  addCostItemTooltip: { ar: 'إضافة عنصر تكلفة', en: 'Add cost item' },
  addCostItemButton: { ar: 'إضافة', en: 'Add' },
  createMaintenanceRequestButton: { ar: 'إنشاء طلب صيانة', en: 'Create Maintenance Request' },
  createMaintenanceRequestForApartment: { ar: 'إنشاء طلب صيانة للشقة', en: 'Create Maintenance Request for Apartment' },
  maintenanceRequestDetails: { ar: 'تفاصيل طلب الصيانة', en: 'Maintenance Request Details' },
  costItemsList: { ar: 'قائمة عناصر التكلفة', en: 'Cost Items List' },
  noCostItemsAdded: { ar: 'لم تتم إضافة أي عناصر تكلفة حتى الآن', en: 'No cost items have been added yet' },
  totalCost: { ar: 'إجمالي التكلفة', en: 'Total Cost' },
  apartment: { ar: 'الشقة', en: 'Apartment' },
  apartmentIsActive: { ar: 'الشقة مفعلة حالياً', en: 'The apartment is currently active' },
  apartmentIsInactive: { ar: 'الشقة غير مفعلة حالياً', en: 'The apartment is currently inactive' },
  apartmentNotFound: { ar: 'لم يتم العثور على الشقة', en: 'Apartment not found' },
  noApartmentsFound: { ar: 'لا توجد شقق متاحة', en: 'No apartments available' },
  deleteMaintenanceCostItem: { ar: 'حذف عنصر التكلفة', en: 'Delete cost item' },
  pleaseSelectClassificationType: { ar: 'يرجى اختيار نوع التصنيف', en: 'Please select classification type' },
  pleaseEnterValidCost: { ar: 'يرجى إدخال تكلفة صحيحة', en: 'Please enter a valid cost' },
  pleaseEnterValidQuantity: { ar: 'يرجى إدخال كمية صحيحة', en: 'Please enter a valid quantity' },
  viewMaintenanceRequest: { ar: 'عرض طلب الصيانة', en: 'View Maintenance Request' },
  requestDetails: { ar: 'تفاصيل الطلب', en: 'Request Details' },
  requestId: { ar: 'رقم الطلب', en: 'Request ID' },
  maintenanceStatus: { ar: 'الحالة', en: 'Status' },
  lastUpdated: { ar: 'آخر تحديث', en: 'Last Updated' },
  apartmentDetails: { ar: 'تفاصيل الشقة', en: 'Apartment Details' },
  maintenanceCostItems: { ar: 'عناصر التكلفة', en: 'Cost Items' },
  noCostItemsFound: { ar: 'لا توجد عناصر تكلفة', en: 'No cost items' },
  noNotes: { ar: 'لا توجد ملاحظات', en: 'No notes' },
  notSpecified: { ar: 'غير محدد', en: 'Not specified' },
  unknown: { ar: 'غير معروف', en: 'Unknown' },
  notApproved: { ar: 'لم تتم الموافقة', en: 'Not Approved' },
  approvedBy: { ar: 'تمت الموافقة بواسطة', en: 'Approved By' },
  approvalDate: { ar: 'تاريخ الموافقة', en: 'Approval Date' },
  maintenanceActions: { ar: 'الإجراءات', en: 'Actions' },
  noActions: { ar: 'لا توجد إجراءات', en: 'No actions' },
  updateStatus: { ar: 'تحديث الحالة', en: 'Update Status' },
  markAsPending: { ar: 'تعليق', en: 'Mark as Pending' },
  markAsApproved: { ar: 'موافقة', en: 'Mark as Approved' },
  markAsRejected: { ar: 'رفض', en: 'Mark as Rejected' },
  markAsCompleted: { ar: 'إكمال', en: 'Mark as Completed' },
  maintenanceRequestNotFound: { ar: 'لم يتم العثور على طلب الصيانة', en: 'Maintenance request not found' },
  statusUpdatedSuccessfully: { ar: 'تم تحديث الحالة بنجاح', en: 'Status updated successfully' },
  errorUpdatingStatus: { ar: 'حدث خطأ أثناء تحديث الحالة', en: 'Error updating status' },
  approvalUpdatedSuccessfully: { ar: 'تم تحديث الموافقة بنجاح', en: 'Approval updated successfully' },
  errorUpdatingApproval: { ar: 'حدث خطأ أثناء تحديث الموافقة', en: 'Error updating approval' },
  actionAddedSuccessfully: { ar: 'تم إضافة الإجراء بنجاح', en: 'Action added successfully' },
  errorAddingAction: { ar: 'حدث خطأ أثناء إضافة الإجراء', en: 'Error adding action' },
  errorFetchingData: { ar: 'حدث خطأ أثناء جلب البيانات', en: 'Error fetching data' },
  currency: { ar: 'ريال', en: 'SAR' },
  managerApproval: { ar: 'موافقة المدير', en: 'Manager Approval' },
  supervisorApproval: { ar: 'موافقة المشرف', en: 'Supervisor Approval' },
  approve: { ar: 'موافقة', en: 'Approve' },
  reject: { ar: 'رفض', en: 'Reject' },
  // حالات طلب الصيانة
  pending: { ar: 'قيد الانتظار', en: 'Pending' },
  approved: { ar: 'تمت الموافقة', en: 'Approved' },
  rejected: { ar: 'مرفوض', en: 'Rejected' },
  completed: { ar: 'مكتمل', en: 'Completed' },
  complete: { ar: 'إكمال', en: 'Complete' },
  maintenanceRequestCreated: { ar: 'تم إنشاء طلب الصيانة بنجاح', en: 'Maintenance request created successfully' },
  errorCreatingMaintenanceRequest: { ar: 'حدث خطأ أثناء إنشاء طلب الصيانة', en: 'Error creating maintenance request' },
  // أزرار وعناصر إضافية
  createMaintenanceRequest: { ar: 'إنشاء طلب صيانة', en: 'Create Maintenance Request' },
  searchMaintenanceRequests: { ar: 'بحث في طلبات الصيانة', en: 'Search Maintenance Requests' },
  lastRecordedCost: { ar: 'آخر تكلفة مسجلة', en: 'Last Recorded Cost' },
  maintenanceCost: { ar: 'تكلفة الصيانة', en: 'Maintenance Cost' },
  status: { ar: 'الحالة', en: 'Status' },
  codeHelperText: { ar: 'أدخل رمز الطلب', en: 'Enter request code' },
  backButton: { ar: 'رجوع', en: 'Back' },
  saveBuilding: { ar: 'حفظ المبنى', en: 'Save Building' },
  approveRequest: { ar: 'الموافقة على الطلب', en: 'Approve Request' },
  rejectRequest: { ar: 'رفض الطلب', en: 'Reject Request' },
  approvalNotesPlaceholder: { ar: 'أضف ملاحظات للموافقة (اختياري)', en: 'Add approval notes (optional)' },
  rejectionNotesPlaceholder: { ar: 'أضف سبب الرفض', en: 'Add reason for rejection' },
};

// إنشاء سياق اللغة
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// مزود سياق اللغة
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // استرجاع اللغة المحفوظة أو استخدام العربية كلغة افتراضية
  const [language, setLanguageState] = useState<Language>('ar');
  
  // تحميل اللغة المفضلة من التخزين المحلي عند بدء التطبيق
  useEffect(() => {
    // التأكد من أن هذا الكود يعمل فقط في جانب العميل
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      }
    }
  }, []);
  
  // تحديث اللغة وحفظها في التخزين المحلي
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // التأكد من أن هذا الكود يعمل فقط في جانب العميل
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };
  
  // دالة الترجمة
  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  // دالة الترجمة (اسم بديل لدالة t)
  const translate = (key: string): string => {
    return t(key);
  };
  
  // تحديد ما إذا كانت اللغة الحالية تستخدم الاتجاه من اليمين إلى اليسار
  const isRTL = language === 'ar';
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook لاستخدام الترجمات
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
