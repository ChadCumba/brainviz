Static Content Folder
=====================

Place your static content in this directory (JPG, GIF, PNG, CSS, JavaScript)
Files in this directory will be served efficiently and safer then using 
Django to serve static files.

Linking to files in this directory
----------------------------------

You can link to the this directory with the 'MEDIA_URL' context varible
like this::
	
	<link src="{{ MEDIA_URL }}README.txt" />

Which turns into the full url of::

    <link src="/apps/poldracklab/brainviz/static/README.txt" />

