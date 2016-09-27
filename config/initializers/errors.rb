ActionView::Base.field_error_proc = Proc.new do |html_tag, instance|
  if html_tag !~ /^\<label/
    "<div class=\"has-error\">#{html_tag}</div>
    <p class=\"alert-danger\">
      #{instance.error_message.join(', ')}
    </p>".html_safe
  else
    "<div class=\"has-error\">#{html_tag}</div>".html_safe
  end
end
