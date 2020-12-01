export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID ?? ''

type ContactEvent = {
  action: 'submit_form'
  category: 'Contact'
  label: string
  value: string
}

type ClickEvent = {
  action: 'click'
  category: 'Other'
  label: string
  value: string
}

type Event = ContactEvent | ClickEvent

export const pageview = (url: string): void => {
  if (process.env.NEXT_PUBLIC_ENV === 'production')
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
}

export const event = ({ action, category, label, value }: Event): void => {
  if (process.env.NEXT_PUBLIC_ENV === 'production')
    window.gtag('event', action, {
      event_category: category,
      event_label: JSON.stringify(label),
      value: value,
    })
}
