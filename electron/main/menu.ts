import {
  app,
  Menu,
  type MenuItemConstructorOptions,
  type MenuItem,
} from "electron";

const template: Array<MenuItemConstructorOptions | MenuItem> = [
  {
    label: "Edit",
    submenu: [
      {
        label: "Reload",
        accelerator: "Cmd+R",
        role: "reload",
      },
    ],
  },
  {
    role: "window",
    submenu: [{ role: "minimize" }, { role: "close" }],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
