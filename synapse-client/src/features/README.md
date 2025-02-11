# New file organization

I know it's kind of early for a reorganization, but I think I want to lean more toward 
prioritizing a feature based folder structure rather than a filetype-type structure.
So I want to strangler-ify the root directory by moving any file I touch into the feature
directory, until it's the only folder. Then I can remove the folder and make features
the new root.