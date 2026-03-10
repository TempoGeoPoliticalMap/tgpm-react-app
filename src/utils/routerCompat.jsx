import React from "react";
import NextLink from "next/link";
import {useRouter} from "next/router";

const normalizePath = path => {
  if (!path) return "/";
  return path.split("?")[0].split("#")[0];
};

const isHashLink = target => typeof target === "string" && target.startsWith("#");

export function Link({to, href, children, ...props}) {
  const target = href ?? to ?? "/";

  if (isHashLink(target)) {
    return (
      <a href={target} {...props}>
        {children}
      </a>
    );
  }

  return (
    <NextLink href={target} {...props}>
      {children}
    </NextLink>
  );
}

export function NavLink({to, end = false, className, ...props}) {
  const router = useRouter();
  const currentPath = normalizePath(router.asPath ?? router.pathname);
  const targetPath = normalizePath(to);
  const isActive = end
    ? currentPath === targetPath
    : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
  const resolvedClassName = typeof className === "function" ? className({isActive}) : className;

  return <Link to={to} className={resolvedClassName} {...props} />;
}

export function useLocation() {
  const router = useRouter();
  const pathname = normalizePath(router.asPath ?? router.pathname);

  return {pathname};
}
