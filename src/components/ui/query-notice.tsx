type QueryNoticeProps = {
  message: string;
};

export function QueryNotice({ message }: QueryNoticeProps) {
  return (
    <div className="rounded-lg border border-border/80 bg-[#FBFAF8] px-4 py-3 text-sm leading-6 text-muted-foreground shadow-sm">
      {message}
    </div>
  );
}
